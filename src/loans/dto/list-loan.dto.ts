import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class ListLoanDto{
    @Type(() => Number) // convierte string del body/query en number
    @IsInt({ message: 'La página debe ser un número entero' })
    @Min(1, { message: 'La página debe ser mayor o igual a 1' })
    page: number;

    @Type(() => Number)
    @IsOptional()
    @IsInt({ message: 'El límite debe ser un número entero' })
    @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
    limit?: number;
}