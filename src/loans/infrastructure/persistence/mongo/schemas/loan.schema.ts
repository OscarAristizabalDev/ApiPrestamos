import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { QuoteFrequency } from 'src/quotes/domain/enums/quote-frequency.enum';
import { QuoteAmortization } from 'src/quotes/domain/enums/quote-amortization.enum';
import { LoanStatus } from 'src/loans/domain/enums/loan-status.enum';
import { LoanType } from 'src/loans/domain/enums/loan-type.enum';

export type LoanDocument = LoanSchemaClass & Document;

@Schema({ _id: false })
export class CustomerSnapshotSchemaClass {
    @Prop()
    id?: string;

    @Prop()
    fullName?: string;

    @Prop({ required: true })
    documentNumber: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    phoneNumber: string;

    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    employmentStatus: string;

    @Prop()
    employerName?: string;

    @Prop({ required: true })
    monthlyIncome: number;

    @Prop({ required: true })
    creditScore: number;

    @Prop({ required: true })
    riskCategory: string;
}

export const CustomerSnapshotSchema = SchemaFactory.createForClass(CustomerSnapshotSchemaClass);

@Schema({ _id: false })
export class ProductSnapshotSchemaClass {
    @Prop()
    id?: string;

    @Prop({ required: true })
    code: string;

    @Prop({ required: true })
    name: string;

    @Prop()
    brand?: string;

    @Prop()
    model?: string;

    @Prop()
    description?: string;

    @Prop({ required: true })
    salePrice: number;

    @Prop()
    imageUrl?: string;
}

export const ProductSnapshotSchema = SchemaFactory.createForClass(ProductSnapshotSchemaClass);

@Schema({ _id: false })
export class LoanQuoteSchemaClass {
    @Prop({ required: true })
    number: number;

    @Prop({ required: true })
    value: number;

    @Prop({ required: true })
    interestValue: number;

    @Prop({ required: true })
    totalValue: number;

    @Prop({ required: true })
    expirationDate: Date;
}

export const LoanQuoteSchema = SchemaFactory.createForClass(LoanQuoteSchemaClass);

@Schema({ timestamps: true })
export class LoanSchemaClass {
    @Prop({ type: Types.ObjectId, ref: 'Client', required: true, index: true })
    client: Types.ObjectId;

    @Prop({ type: CustomerSnapshotSchema, required: true })
    customerSnapshot: CustomerSnapshotSchemaClass;

    @Prop({ type: Types.ObjectId, ref: 'User', default: null })
    approvedBy: Types.ObjectId | null;

    @Prop({ type: Types.ObjectId, ref: 'Product', default: null, index: true })
    product: Types.ObjectId | null;

    @Prop({ type: ProductSnapshotSchema, default: null })
    productSnapshot: ProductSnapshotSchemaClass | null;

    @Prop({ required: true, min: 0 })
    amount: number;

    @Prop({ required: true, default: 'COP' })
    currency: string;

    @Prop({ required: true, min: 0 })
    interestRate: number;

    @Prop({ required: true, enum: LoanType })
    loanType: LoanType;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true, enum: QuoteFrequency })
    frequency: QuoteFrequency;

    @Prop({ required: true, min: 1 })
    numberQuotes: number;

    @Prop({ required: true, enum: QuoteAmortization })
    amortization: QuoteAmortization;

    @Prop({ type: [LoanQuoteSchema], required: true })
    quotes: LoanQuoteSchemaClass[];

    @Prop({ required: true, enum: LoanStatus, default: LoanStatus.ACTIVE })
    status: LoanStatus;
}

export const LoanSchema = SchemaFactory.createForClass(LoanSchemaClass);
