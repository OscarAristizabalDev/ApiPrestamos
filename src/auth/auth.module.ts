import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-tokens.entity';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';
import { UsersModule } from '../users/user.module';
import { ConfigModule } from '@nestjs/config';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_ACCESS_SECRET || 'supersecreto',
        signOptions: { expiresIn: '15m' },
      }),
    }),
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy, 
    JwtStrategy,
    JwtRefreshStrategy,
    LocalAuthGuard,
    RefreshTokenGuard,
    RolesGuard
  ],
  exports: [AuthService],
})
export class AuthModule {}