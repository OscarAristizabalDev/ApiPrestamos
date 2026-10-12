import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductSnapshotRequestDto {
    @ApiPropertyOptional({ description: 'Product id at snapshot time' })
    @IsOptional()
    @IsString()
    readonly id?: string;

    @ApiProperty({ example: 'PRD-001' })
    @IsString()
    readonly code: string;

    @ApiProperty({ example: 'Laptop 14"' })
    @IsString()
    readonly name: string;

    @ApiPropertyOptional({ example: 'Lenovo' })
    @IsOptional()
    @IsString()
    readonly brand?: string;

    @ApiPropertyOptional({ example: 'IdeaPad 5' })
    @IsOptional()
    @IsString()
    readonly model?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly description?: string;

    @ApiProperty({ description: 'Sale price at snapshot time', example: 2800000 })
    @IsNumber()
    readonly salePrice: number;

    @ApiPropertyOptional({ example: 'https://example.com/laptop.png' })
    @IsOptional()
    @IsString()
    readonly imageUrl?: string;
}
