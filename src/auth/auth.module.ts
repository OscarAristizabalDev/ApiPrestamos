import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
// import { LocalStrategy } from './strategy/local.strategy';
import { UsersModule } from '../users/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { RolesGuard } from './guards/roles.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { RefreshTokenRepository } from './repositories/refreshToken.repository';
import * as passport from 'passport'; 
import { Strategy as LocalStrategy } from 'passport-local';

@Module({
  imports: [
    forwardRef( ()=> UsersModule),
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: process.env.JWT_ACCESS_SECRET || 'supersecreto',
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {name: RefreshToken.name, schema: RefreshTokenSchema}
  ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'PASSPORT_INITIALIZER',
      useFactory: (authService: AuthService) => {
        
        // Verificar si ya existe
        if (passport._strategies && passport._strategies['local']) {
          return true;
        }
        
        // Registrar estrategia local
        passport.use(
          'local',
          new LocalStrategy(
            { usernameField: 'email' },
            async (email, password, done) => {
              try {
                const user = await authService.validateUser(email, password);
                if (!user) {
                  return done(null, false, { message: 'Credenciales incorrectas' });
                }
                return done(null, user);
              } catch (error) {
                return done(error, false);
              }
            }
          )
        );        
        return true;
      },
      inject: [AuthService],
    },
   // LocalStrategy, 
    JwtStrategy,
    RefreshTokenRepository,
    {
      provide: 'IRefreshTokenRepository',
      useClass: RefreshTokenRepository,
    },
    {
      provide: LocalAuthGuard,
      useFactory: (authService: AuthService) => {
        return new LocalAuthGuard(authService);
      },
      inject: [AuthService],
    },
    RefreshTokenGuard,
    RolesGuard
  ],
  exports: [AuthService, MongooseModule],
})
export class AuthModule {}