import { forwardRef, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
            (req: Request) => req.cookies?.['refreshToken'],
            ]),
            secretOrKey: process.env.REFRESH_TOKEN_SECRET || 'superrefresh',
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: JwtPayload) {
        const refreshtToken = req.cookies?.['refreshToken'];
        if(!refreshtToken) throw new UnauthorizedException('refresh token not found')

        const user = await this.authService.validateRefreshToken(payload.sub, refreshtToken);
        if(!user) throw new UnauthorizedException('user not found by the refresh token');

        return user;
    }
}