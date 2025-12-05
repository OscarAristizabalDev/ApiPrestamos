import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: true })
export class RefreshToken {
    @Prop({ required: true })
    token: string;

    @Prop({ required: true })
    expires: Date;

    @Prop({ default: false })
    revoked: boolean;

    @Prop({ type: Types.ObjectId, ref: 'UserDocument' })
    userID: Types.ObjectId;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);