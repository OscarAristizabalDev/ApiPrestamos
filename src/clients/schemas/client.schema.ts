import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema({ timestamps: true })
export class Client {
    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true })
    registrationDate: Date;

    @Prop()
    dateOfBirth: Date;

    @Prop()
    nationalId: string;

    @Prop()
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

    @Prop({ default: 0 })
    totalOutstandingLoans: number;

    @Prop({ default: 0 })
    numberOfActiveLoans: number;

    @Prop()
    riskCategory: string; // e.g., Low, Medium, High

    @Prop()
    notes: string;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
