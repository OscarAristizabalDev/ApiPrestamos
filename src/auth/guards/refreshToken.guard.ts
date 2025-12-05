import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../services/auth.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const refreshToken = request.cookies?.['refreshToken'];
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      // Verificar JWT
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'superrefresh',
      });
      
      // Validar refresh token en base de datos
      const {user, idCurrentToken} = await this.authService.validateRefreshToken(payload.sub, refreshToken);
      
      if (!user) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      
      // Agregar usuario al request
      request.user = user;
      // request.refreshTokenPayload = payload;
      return true;
      
    } catch (error) {      
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      } else if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }
      
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}