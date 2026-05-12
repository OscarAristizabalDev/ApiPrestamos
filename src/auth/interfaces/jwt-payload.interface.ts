export interface JwtPayload{
    sub: string;
    email: string;
    role: string;
    fullName?: string;
    iat?: number;
    exp?: number;
}