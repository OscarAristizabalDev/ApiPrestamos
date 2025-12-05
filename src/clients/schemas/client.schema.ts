import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema({ timestamps: true })
export class Client {
    @Prop({ required: true })
    names: string;

    @Prop({ required: true })
    surnames: string;

    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true })
    registrationDate: Date;

    @Prop()
    birthdate: Date;

    @Prop({ type: Types.ObjectId, ref: 'TypeDocument' })
    typeDocument: Types.ObjectId;

    @Prop({index: true})
    documentNumber: string;

    @Prop({index: true})
    email: string;

    @Prop()
    phoneNumber: string;

    @Prop()
    address: string;

    @Prop()
    employmentStatus: string; // e.g., Employed, Self-Employed, Unemployed

    @Prop()
    employerName: string;

    @Prop()
    monthlyIncome: number;

    @Prop()
    creditScore: number;

    @Prop()
    riskCategory: string; // e.g., Low, Medium, High

    @Prop()
    notes: string;

    @Prop()
    active: number;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
