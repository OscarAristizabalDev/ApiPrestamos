import { ApiPropertyOptional } from '@nestjs/swagger';
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

    @ApiPropertyOptional({ description: 'Loan principal, up to 2 decimals', example: 5000000 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    readonly amount?: number;

    @ApiPropertyOptional({ description: 'ISO-4217 currency code', example: 'COP' })
    @IsOptional()
    @IsISO4217CurrencyCode()
    readonly currency?: string;

    @ApiPropertyOptional({ description: 'Interest rate per period, as a percentage', example: 2.5 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 4 })
    @IsPositive()
    readonly interestRate?: number;

    @ApiPropertyOptional({ description: 'ISO-8601 start date of the schedule', example: '2026-11-01' })
    @IsOptional()
    @IsDateString()
    readonly startDate?: string;

    @ApiPropertyOptional({ enum: QuoteFrequency, description: 'Payment frequency' })
    @IsOptional()
    @IsEnum(QuoteFrequency)
    readonly frequency?: QuoteFrequency;

    @ApiPropertyOptional({ description: 'Number of quotes in the schedule', example: 12 })
    @IsOptional()
    @IsInt()
    @IsPositive()
    readonly numberQuotes?: number;

    @ApiPropertyOptional({ enum: QuoteAmortization, description: 'Amortization system' })
    @IsOptional()
    @IsEnum(QuoteAmortization)
    readonly amortization?: QuoteAmortization;

    @ApiPropertyOptional({
        type: () => [LoanQuoteRequestDto],
        description: 'Schedule from POST /quotes; required when amount, interestRate, startDate, frequency, numberQuotes or amortization change',
    })
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => LoanQuoteRequestDto)
    readonly quotes?: LoanQuoteRequestDto[];
}
