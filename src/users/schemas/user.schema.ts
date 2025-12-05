import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    names: string;

    @Prop({ required: true })
    surnames: string;

    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true })
    registrationDate: Date;

    @Prop({ required: true, index: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    phoneNumber: string;

    @Prop()
    address: string;

    @Prop({ required: true })
    birthdate: Date; 

    @Prop()
    refreshToken: string;

    @Prop({default: 'offline'})
    status: string;

    @Prop({default: 1})
    active: number;

    @Prop({default: 'user'})
    role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);