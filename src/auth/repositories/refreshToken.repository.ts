import { ConflictException, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { RefreshToken, RefreshTokenDocument } from "../schemas/refresh-token.schema";
import { IRefreshTokenRepository, RefreshTokenInterface } from "../interfaces/refreshToken.interface";


@Injectable({ scope: Scope.REQUEST })
export class RefreshTokenRepository implements IRefreshTokenRepository{
    constructor(
            @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>
        ) {
    }

    async saveRefreshToken(data: RefreshTokenInterface){
        const refreshToken = new this.refreshTokenModel(data);
        return await refreshToken.save();
    }

    async findRefreshToken(userID: string, token: string): Promise<RefreshTokenDocument | null>{
        const refreshTokenFound = await this.refreshTokenModel.findOne({userID, token, revoked: false}).exec();    
        if(!refreshTokenFound) throw new NotFoundException('No refresh token were found');
        return refreshTokenFound;
    }

    async updateRefreshToken(idCurrentToken: string, token: string): Promise<RefreshTokenDocument>{
        let objectID;
        if(idCurrentToken !== null && idCurrentToken !== undefined) objectID = new Types.ObjectId(idCurrentToken);
        if(!Types.ObjectId.isValid(objectID)) throw new ConflictException('ID submited is not valid');
        const refreshTokenUpdated = await this.refreshTokenModel.findByIdAndUpdate(objectID,{token}, {new: true}).exec();
        if(!refreshTokenUpdated) throw new NotFoundException('Refresh Token not found');
        return refreshTokenUpdated;
    }

    async revokeToken(token: string): Promise<{message: string}>{
        const refreshTokenRevoked = await this.refreshTokenModel.findOneAndUpdate({token},{revoked: true}, {new: true}).exec();
        if(!refreshTokenRevoked) throw new NotFoundException('Refresh Token not found');
        return {message: 'token revoqued'};
    }
}