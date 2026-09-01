import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { QuoteFrequency } from 'src/quotes/domain/enums/quote-frequency.enum';
import { QuoteAmortization } from 'src/quotes/domain/enums/quote-amortization.enum';

export class CalculateQuoteRequestDto {

    @IsNotEmpty()
    @IsNumber()
    readonly amount: number;

    @IsNotEmpty()
    @IsEnum(QuoteFrequency)
    readonly frequency;

    @IsNotEmpty()
    @IsNumber()
    readonly numberQuotes: number;

    @IsNotEmpty()
    @IsNumber()
    readonly interestRate: number;

    @IsNotEmpty()
    @IsEnum(QuoteAmortization)
    readonly amortization;

    /**
     * Fecha de inicio del préstamo (ISO-8601). Opcional: si no viene, los
     * vencimientos se calculan desde hoy (comportamiento previo).
     */
    @IsOptional()
    @IsDateString()
    readonly startDate?: string;

}
