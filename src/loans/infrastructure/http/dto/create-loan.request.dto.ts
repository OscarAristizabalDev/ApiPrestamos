import { IsDateString, IsEnum, IsInt, IsMongoId, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { LoanAmortizationMethod } from 'src/loans/domain/enums/loan-amortization-method.enum';
import { LoanInterestRateType } from 'src/loans/domain/enums/loan-interest-rate-type.enum';
import { LoanPaymentFrequency } from 'src/loans/domain/enums/loan-payment-frequency.enum';

export class CreateLoanRequestDto {

    @IsMongoId()
    readonly clientId: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    readonly amount: number;

    @IsString()
    @IsOptional()
    readonly currency: string = 'COP';

    @IsNumber({ maxDecimalPlaces: 4 })
    @IsPositive()
    readonly interestRate: number;

    @IsEnum(LoanInterestRateType)
    readonly interestRateType: LoanInterestRateType;

    @IsInt()
    @IsPositive()
    readonly term: number;

    @IsEnum(LoanPaymentFrequency)
    readonly paymentFrequency: LoanPaymentFrequency;

    @IsEnum(LoanAmortizationMethod)
    readonly amortizationMethod: LoanAmortizationMethod;

    @IsDateString()
    readonly startDate: string;

    @IsString()
    readonly loanType: string;

    @IsString()
    @IsOptional()
    readonly warranty?: string;
}
