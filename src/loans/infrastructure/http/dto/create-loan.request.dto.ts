import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsMongoId,
    IsNumber,
    IsOptional,
    IsPositive,
    ValidateNested,
} from 'class-validator';
import { LoanType } from 'src/loans/domain/enums/loan-type.enum';
import { QuoteFrequency } from 'src/quotes/domain/enums/quote-frequency.enum';
import { QuoteAmortization } from 'src/quotes/domain/enums/quote-amortization.enum';
import { CustomerSnapshotRequestDto } from './customer-snapshot.request.dto';
import { ProductSnapshotRequestDto } from './product-snapshot.request.dto';
import { LoanQuoteRequestDto } from './loan-quote.request.dto';

export class CreateLoanRequestDto {

    @IsMongoId()
    readonly customerId: string;

    @ValidateNested()
    @Type(() => CustomerSnapshotRequestDto)
    readonly customerSnapshot: CustomerSnapshotRequestDto;

    @IsOptional()
    @IsMongoId()
    readonly productId?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => ProductSnapshotRequestDto)
    readonly productSnapshot?: ProductSnapshotRequestDto;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    readonly amount: number;

    @IsEnum(LoanType)
    readonly loanType: LoanType;

    @IsDateString()
    readonly startDate: string;

    @IsEnum(QuoteFrequency)
    readonly frequency: QuoteFrequency;

    @IsInt()
    @IsPositive()
    readonly numberQuotes: number;

    @IsNumber({ maxDecimalPlaces: 4 })
    @IsPositive()
    readonly interestRate: number;

    @IsEnum(QuoteAmortization)
    readonly amortization: QuoteAmortization;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => LoanQuoteRequestDto)
    readonly quotes: LoanQuoteRequestDto[];
}
