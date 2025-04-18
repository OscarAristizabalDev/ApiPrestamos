
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CalculatePaymentDto {

    @IsNotEmpty()
    @IsNumber()
    readonly amount: number;

    @IsNotEmpty()
    @IsNumber()
    readonly frequency: number;

    @IsNotEmpty()
    @IsNumber()
    readonly numberPayments: number;

    @IsNotEmpty()
    @IsNumber()
    readonly interestPercentage: number;


}