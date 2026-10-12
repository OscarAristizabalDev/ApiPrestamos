import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { QuoteFrequency } from 'src/quotes/domain/enums/quote-frequency.enum';
import { QuoteAmortization } from 'src/quotes/domain/enums/quote-amortization.enum';

export class CalculateQuoteRequestDto {

    @ApiProperty({ description: 'Loan principal', example: 5000000 })
    @IsNotEmpty()
    @IsNumber()
    readonly amount: number;

    @ApiProperty({ enum: QuoteFrequency, description: 'Payment frequency' })
    @IsNotEmpty()
    @IsEnum(QuoteFrequency)
    readonly frequency;

    @ApiProperty({ description: 'Number of quotes in the schedule', example: 12 })
    @IsNotEmpty()
    @IsNumber()
    readonly numberQuotes: number;

    @ApiProperty({ description: 'Interest rate per period, as a percentage', example: 2.5 })
    @IsNotEmpty()
    @IsNumber()
    readonly interestRate: number;

    @ApiProperty({ enum: QuoteAmortization, description: 'Amortization system' })
    @IsNotEmpty()
    @IsEnum(QuoteAmortization)
    readonly amortization;

    /**
     * Fecha de inicio del préstamo (ISO-8601). Opcional: si no viene, los
     * vencimientos se calculan desde hoy (comportamiento previo).
     */
    @ApiPropertyOptional({
        description: 'ISO-8601 loan start date; due dates are calculated from today when omitted. Send the same value when creating or editing the loan',
        example: '2026-11-01',
    })
    @IsOptional()
    @IsDateString()
    readonly startDate?: string;

}
