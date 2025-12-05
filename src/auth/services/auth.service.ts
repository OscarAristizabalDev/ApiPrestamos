import { ConflictException, forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { add } from 'date-fns';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../users/users.service';
import { LoginDto } from '../dto/login.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { RefreshTokenRepository } from '../repositories/refreshToken.repository';
import { RefreshTokenDocument } from '../schemas/refresh-token.schema';
import { UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepo: RefreshTokenRepository,
    @Inject(forwardRef(() => UserService))
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async validateUser(email: string, pass: string): Promise<UserDocument> {
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
    const payload = { sub: user._id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') as JwtSignOptions['expiresIn'],
    });
    const payloadRefresh = { sub: String(user.id), email: user.email, role: user.role}

    const refreshToken = await this.generateRefreshToken(user, payloadRefresh, false);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(userId: string, token: string) {
    const {user , idCurrentToken} = await this.validateRefreshToken(userId, token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const payload = { sub: user.id, email: user.email, role: user.role};
    const newAccessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') as JwtSignOptions['expiresIn'],
    });

    const payloadRefresh = { sub: user.id, email: user.email, role: user.role}

    const newRefreshToken = await this.generateRefreshToken(user, payloadRefresh, true, idCurrentToken);

    // await this.revokeToken(token);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
  async generateRefreshToken(user: UserDocument, payload: JwtPayload, isRefresh: boolean, idCurrentToken?: string): Promise<string>{
    let payloadSign = {sub: payload.sub, email: payload.email, role: payload.role};
    const refreshToken = await this.jwtService.sign(payloadSign, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') as JwtSignOptions['expiresIn'],
    });

    const tokenhashed = crypto.createHash('sha256').update(refreshToken).digest('hex');

    if(isRefresh && idCurrentToken) await this.refreshTokenRepo.updateRefreshToken(idCurrentToken, tokenhashed);
    else await this.refreshTokenRepo.saveRefreshToken({
      userID: user.id,
      token: tokenhashed,
      expires: add(new Date(), { days: 1 }),
    });

    await this.usersService.updateRefreshToken(user.id, tokenhashed);

    return refreshToken;
  }

  async logout(token: string): Promise<void> {
    await this.revokeToken(token);
  }

  async findToken(token: string, userID: string): Promise<RefreshTokenDocument | null> {
    return await this.refreshTokenRepo.findRefreshToken(userID, token);
  }

  async revokeToken(token: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    await this.refreshTokenRepo.revokeToken(hashedToken);
  }

  async validateRefreshToken(userID: string, token: string): Promise<{user:UserDocument, idCurrentToken: string}> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const found = await this.findToken(hashedToken, userID);
  
    if (!found || found.revoked) throw new ConflictException('Token not found or expired');

    if(found.expires < new Date()){
      this.revokeToken(hashedToken);
      throw new ConflictException("Refresh Token expired please login again");
    }

    const user = await this.usersService.findOneById(userID);

    if(!user) throw new NotFoundException('No user found')

    if(user.refreshToken !== hashedToken) throw new ConflictException('No refresh tokens match')

    return {user, idCurrentToken: found.id};
  }
}