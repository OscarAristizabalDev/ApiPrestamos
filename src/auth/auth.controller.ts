import { BadRequestException, Body, ConflictException, Controller, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { Request, Response } from 'express';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from './decorators/auth-user.decorator';
import { CurrentUserDto } from './dto/current-user.dto';

@ApiTags('Auth/Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ description: 'Credenciales del usuario (email, password)', schema: {
    type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'correo@ejemplo.com',
        },
        password: {
          type: 'string',
          example: '12345ohptrp"#',
        },
      }
  } })
  @ApiOperation({ summary: 'Login del usuario' })
  @ApiResponse({ status: 200, description: 'Login exitoso.', schema: {
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    },
  } })
  async login(@Body() req: LoginDto, @Res({ passthrough: true }) res: Response) {

    if (!req.email || !req.password) {
      throw new ConflictException('Access credentials not provided');
    }
  
    const {accessToken, refreshToken} = await this.authService.login(req);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    return { accessToken: accessToken };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar el accessToken con un refreshToken' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Token refrescado con éxito.' })
  async refresh(@Req() req: Request, @AuthUser() user: CurrentUserDto, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['refreshToken'];
    const tokens = await this.authService.refresh(user.id,token);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión del usuario' })
  @ApiCookieAuth()
  @ApiBody({
    description: 'La cookie `refreshToken` debe estar presente en la petición',
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Sesión cerrada con éxito.', schema: {
    example: {
      message: 'Logged out successfully',
    },
  } })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. La cookie `refreshToken` no es válida o no existe.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['refreshToken'];
    if(!token) throw new BadRequestException('refresh token not found in cookies');
    await this.authService.logout(token);
    res.clearCookie('refreshToken', { path: '/auth/' });
    return { message: 'Logged out successfully' };
  }
}