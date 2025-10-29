import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { add } from 'date-fns';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/users.service';
import { Users } from '../users/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dto/login.dto';
import { RefreshToken } from './entities/refresh-tokens.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async validateUser(email: string, pass: string): Promise<Users> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      return user;
    }
    throw new ConflictException('Credenciales de acceso incorrectas');
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findOneByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
    });
    const payloadRefresh = { sub: String(user.id), email: user.email, role: user.role}

    const refreshToken = await this.generateRefreshToken(user, payloadRefresh);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(userId: string, token: string) {
    const user = await this.validateRefreshToken(userId, token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const payload = { sub: user.id, email: user.email, role: user.role};
    const newAccessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
    });

    const payloadRefresh = { sub: String(user.id), email: user.email, role: user.role}

    const newRefreshToken = await this.generateRefreshToken(user, payloadRefresh);

    await this.revokeToken(token);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
  async generateRefreshToken(user: Users, payload: JwtPayload): Promise<string>{
    let payloadSign = {sub: Number(payload.sub), email: payload.email, role: payload.role};
    const refreshToken = await this.jwtService.sign(payloadSign, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
    });

    const tokenhashed = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await this.refreshTokenRepo.save({
      user,
      token: tokenhashed,
      expires: add(new Date(), { days: 1 }),
    });

    await this.usersService.updateRefreshToken(user.id.toString(), tokenhashed);

    return refreshToken;
  }

  async logout(token: string): Promise<void> {
    await this.revokeToken(token);
  }

  async findToken(token: string, userId: string): Promise<RefreshToken | null> {
    return await this.refreshTokenRepo.findOne({
      where: { 
        user: {id: Number(userId)},
        token 
      },
      relations: ['user'],
    });
  }

  async revokeToken(token: string): Promise<void> {
    await this.refreshTokenRepo.update({ token }, { revoked: true });
  }

  async deleteUserTokens(user: Users): Promise<void> {
    await this.refreshTokenRepo.delete({ user: user });
  }

  async validateRefreshToken(userId: string, token: string): Promise<Users | null> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const found = await this.findToken(hashedToken, userId);

    if (!found || found.revoked || found.expires < new Date()) throw new ConflictException('Token not found or expired');

    const user = await this.usersService.findOneById(userId);

    if(!user) throw new UnauthorizedException('No user found')

    if(user.refreshToken !== hashedToken) throw new ConflictException('No refresh tokens match')

    return user;
  }
}