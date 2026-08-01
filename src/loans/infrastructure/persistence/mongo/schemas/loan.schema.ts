import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LoanAmortizationMethod } from 'src/loans/domain/enums/loan-amortization-method.enum';
import { LoanInterestRateType } from 'src/loans/domain/enums/loan-interest-rate-type.enum';
import { LoanPaymentFrequency } from 'src/loans/domain/enums/loan-payment-frequency.enum';
import { LoanStatus } from 'src/loans/domain/enums/loan-status.enum';

export type LoanDocument = LoanSchemaClass & Document;

@Schema({ timestamps: true })
export class LoanSchemaClass {
    @Prop({ type: Types.ObjectId, ref: 'Client', required: true, index: true })
    client: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', default: null })
    approvedBy: Types.ObjectId | null;

    @Prop({ required: true, min: 0 })
    amount: number;

    @Prop({ required: true, default: 'COP' })
    currency: string;

    @Prop({ required: true, min: 0 })
    interestRate: number;

    @Prop({ required: true, enum: LoanInterestRateType })
    interestRateType: LoanInterestRateType;

    @Prop({ required: true, min: 1 })
    term: number;

    @Prop({ required: true, enum: LoanPaymentFrequency })
    paymentFrequency: LoanPaymentFrequency;

    @Prop({ required: true, enum: LoanAmortizationMethod })
    amortizationMethod: LoanAmortizationMethod;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    loanType: string;

    @Prop({ required: true, enum: LoanStatus, default: LoanStatus.ACTIVE })
    status: LoanStatus;

    @Prop()
    warranty?: string;
}

export const LoanSchema = SchemaFactory.createForClass(LoanSchemaClass);
