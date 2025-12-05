import { RefreshTokenDocument } from "../schemas/refresh-token.schema";

export interface IRefreshTokenRepository{
    saveRefreshToken(data: RefreshTokenInterface): Promise<RefreshTokenDocument>;
    findRefreshToken(userID: string, token: string): Promise<RefreshTokenDocument | null>;
    updateRefreshToken(id: string,token: string): Promise<RefreshTokenDocument>;
    revokeToken(token: string):Promise<{message: string}>;
}

export interface RefreshTokenInterface{
    token: string;
    expires: Date;
    revoked?: boolean;
    userID: string;
}