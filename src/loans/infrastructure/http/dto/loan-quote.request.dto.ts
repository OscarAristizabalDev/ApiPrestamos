import { IsDateString, IsInt, IsNumber, IsPositive } from 'class-validator';

export class LoanQuoteRequestDto {
    @IsInt()
    @IsPositive()
    readonly number: number;

    @IsNumber()
    readonly value: number;

    @IsNumber()
    readonly interestValue: number;

    @IsNumber()
    readonly totalValue: number;

    @IsDateString()
    readonly expirationDate: string;
}
