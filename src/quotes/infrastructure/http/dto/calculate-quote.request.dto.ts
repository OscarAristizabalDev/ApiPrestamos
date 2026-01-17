import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
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

}