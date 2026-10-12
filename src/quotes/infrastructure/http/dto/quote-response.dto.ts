import { ApiProperty } from "@nestjs/swagger";

export class QuoteResponseDto {

    @ApiProperty({ description: 'Quote number, starting at 1', example: 1 })
    number: number;

    @ApiProperty({
        example: '2026-01-15T00:00:00.000Z',
        description: 'Expiration date in ISO-8601 format',
    })
    expirationDate: string;

    @ApiProperty({ description: 'Principal paid in this quote', example: 2000 })
    value: number;

    @ApiProperty({ description: 'Interest paid in this quote', example: 500 })
    interestValue: number;

    @ApiProperty({ description: 'Principal plus interest', example: 2500 })
    totalValue: number;
}