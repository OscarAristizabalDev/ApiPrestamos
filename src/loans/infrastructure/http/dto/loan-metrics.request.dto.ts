import { IsDateString, IsOptional } from 'class-validator';

export class LoanMetricsRequestDto {

    /** Inicio del rango (ISO-8601) sobre `startDate`. Si no viene, no se acota. */
    @IsOptional()
    @IsDateString({}, { message: 'La fecha inicial debe ser una fecha válida' })
    readonly from?: string;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha final debe ser una fecha válida' })
    readonly to?: string;
}
