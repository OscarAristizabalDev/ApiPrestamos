import { Expose, Transform, Type } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";
import { AmortizationMethod, InterestRateType, LoanStatus, PaymentFrequency } from "../enums/enums";

export class CreateLoanDto {
  // 🔹 Relations
  @IsInt()
  @IsPositive()
  client_id: number;

  @IsInt()
  @IsPositive()
  approved_by: string;

  // 🔹 Core loan data
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  currency: string = 'COP';

  // 🔹 Interest
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  interest_rate: number; // e.g. 0.10

  @IsEnum(InterestRateType)
  interest_rate_type: InterestRateType;

  // 🔹 Term & frequency
  @IsInt()
  @IsPositive()
  term: number; // number of payments

  @IsEnum(PaymentFrequency)
  payment_frequency: PaymentFrequency;

  // 🔹 Amortization
  @IsEnum(AmortizationMethod)
  amortization_method: AmortizationMethod;

  // 🔹 Dates
  @IsDateString()
  start_date: string;

  // 🔹 Classification
  @IsString()
  loan_type: string;

  @IsEnum(LoanStatus)
  @IsOptional()
  status: LoanStatus = LoanStatus.ACTIVE;

  // 🔹 Optional business rules
  @IsString()
  @IsOptional()
  warranty?: string;
}

export class LoanResponseDto {
    @Expose()
    readonly id: number;
  
    @Expose()
    readonly amount: number;
  
    @Expose()
    readonly status: string;
  
    @Expose()
    @Type(()=> ClientLoanDto)
    readonly client: ClientLoanDto | null;
  
    @Expose()
    @Type(()=> ApprovedByDto)
    readonly approved_by: ApprovedByDto | null;
  }

  export class ApprovedByDto{
    @Expose()
    readonly id: number;

    @Expose()
    readonly fullName: string;
  }

  export class ClientLoanDto{
    @Expose()
    readonly id: number;

    @Expose()
    readonly fullName: string;
    
    @Expose()
    readonly email: string;
    
    @Expose()
    readonly document_number: number;
  }