import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class LoanMetricsRequestDto {

    /** Inicio del rango (ISO-8601) sobre `startDate`. Si no viene, no se acota. */
    @ApiPropertyOptional({
        description: 'Inclusive lower bound (ISO-8601) on the loan start date; unbounded when omitted',
        example: '2026-01-01',
    })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha inicial debe ser una fecha válida' })
    readonly from?: string;

    @ApiPropertyOptional({
        description: 'Inclusive upper bound (ISO-8601) on the loan start date; unbounded when omitted',
        example: '2026-12-31',
    })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha final debe ser una fecha válida' })
    readonly to?: string;
}
