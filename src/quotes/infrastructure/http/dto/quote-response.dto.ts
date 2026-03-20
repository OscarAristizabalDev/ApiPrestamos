import { ApiProperty } from "@nestjs/swagger";

export class QuoteResponseDto {

    @ApiProperty({ example: 1 })
    number: number;

    @ApiProperty({
        example: '2026-01-15',
        description: 'Expiration date in ISO-8601 format',
    })
    expirationDate: string;

    @ApiProperty({ example: 2000 })
    value: number;

    @ApiProperty({ example: 500 })
    interestValue: number;

    @ApiProperty({ example: 2500 })
    totalValue: number;
}