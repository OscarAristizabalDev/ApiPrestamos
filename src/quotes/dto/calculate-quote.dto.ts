
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CalculateQuoteDto {

    @IsNotEmpty()
    @IsNumber()
    readonly amount: number;

    @IsNotEmpty()
    @IsNumber()
    readonly frequency: number;

    @IsNotEmpty()
    @IsNumber()
    readonly numberQuotes: number;

    @IsNotEmpty()
    @IsNumber()
    readonly interestRate: number;


}