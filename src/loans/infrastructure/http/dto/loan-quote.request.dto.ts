import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber, IsPositive } from 'class-validator';

export class LoanQuoteRequestDto {
    @ApiProperty({ description: 'Quote number, starting at 1', example: 1 })
    @IsInt()
    @IsPositive()
    readonly number: number;

    @ApiProperty({ description: 'Principal paid in this quote', example: 416666.67 })
    @IsNumber()
    readonly value: number;

    @ApiProperty({ description: 'Interest paid in this quote', example: 125000 })
    @IsNumber()
    readonly interestValue: number;

    @ApiProperty({ description: 'Principal plus interest', example: 541666.67 })
    @IsNumber()
    readonly totalValue: number;

    @ApiProperty({ description: 'ISO-8601 due date', example: '2026-12-01' })
    @IsDateString()
    readonly expirationDate: string;
}
