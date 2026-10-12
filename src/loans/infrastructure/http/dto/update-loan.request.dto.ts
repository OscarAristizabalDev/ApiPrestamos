import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsEnum,
    IsISO4217CurrencyCode,
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
    ValidateNested,
} from 'class-validator';
import { QuoteFrequency } from 'src/quotes/domain/enums/quote-frequency.enum';
import { QuoteAmortization } from 'src/quotes/domain/enums/quote-amortization.enum';
import { LoanQuoteRequestDto } from './loan-quote.request.dto';

// Partial update: only the provided terms change. When a schedule term changes,
// `quotes` must carry the schedule recalculated through the quotes endpoint.
export class UpdateLoanRequestDto {

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    readonly amount?: number;

    @IsOptional()
    @IsISO4217CurrencyCode()
    readonly currency?: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 4 })
    @IsPositive()
    readonly interestRate?: number;

    @IsOptional()
    @IsDateString()
    readonly startDate?: string;

    @IsOptional()
    @IsEnum(QuoteFrequency)
    readonly frequency?: QuoteFrequency;

    @IsOptional()
    @IsInt()
    @IsPositive()
    readonly numberQuotes?: number;

    @IsOptional()
    @IsEnum(QuoteAmortization)
    readonly amortization?: QuoteAmortization;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => LoanQuoteRequestDto)
    readonly quotes?: LoanQuoteRequestDto[];
}
