import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as passport from 'passport';
import { AuthService } from '../services/auth.service';
import { Strategy as LocalStrategy } from 'passport-local';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    private static passportInitialized = false;
  
  constructor(private authService: AuthService) {
    super();    
    // Inicializar Passport si no está inicializado
    this.initializePassportIfNeeded();
  }
  
  private initializePassportIfNeeded() {
    if (LocalAuthGuard.passportInitialized) {
      return;
    }
    
    // Registrar estrategia local
    passport.use(
      'local',
      new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
          try {
            const user = await this.authService.validateUser(email, password);
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
    
    LocalAuthGuard.passportInitialized = true;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    // Verificar y asegurar que Passport esté inicializado
    this.initializePassportIfNeeded();
    
    const request = context.switchToHttp().getRequest();
    
    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch (error) {
      throw new UnauthorizedException('Auth Error');
    }
  }
}