import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListLoanRequestDto {
    @ApiProperty({ type: 'integer', description: 'Page number, starting at 1', minimum: 1, example: 1 })
    @Type(() => Number)
    @IsInt({ message: 'La página debe ser un número entero' })
    @Min(1, { message: 'La página debe ser mayor o igual a 1' })
    page: number;

    @ApiPropertyOptional({
        description: 'Page size; defaults to the PAGINATION_LIMIT setting (10 when unset)',
        type: 'integer',
        minimum: 1,
        example: 10,
    })
    @Type(() => Number)
    @IsOptional()
    @IsInt({ message: 'El límite debe ser un número entero' })
    @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
    limit?: number;

    @ApiPropertyOptional({
        description: 'Case-insensitive partial match on the customer full name or document number',
        example: 'Jane',
    })
    @IsOptional()
    @IsString({ message: 'El texto de búsqueda debe ser una cadena' })
    search?: string;
}
