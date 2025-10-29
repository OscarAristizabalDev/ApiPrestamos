import { Expose, Transform, Type } from "class-transformer";
import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";

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

export class CreateLoanDto {
    @IsInt()
    @IsNotEmpty()
    client_id: number;

    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive({ message: 'El monto debe ser positivo' })
    amount: number;

    @IsNotEmpty()
    @IsString()
    currency?: string = 'COP';

    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    interest_rate: number;

    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    term: number;

    @IsNotEmpty()
    @IsDateString()
    start_date: string;

    @IsNotEmpty()
    @IsDateString()
    end_date?: string;

    @IsNotEmpty()
    @IsString()
    loan_type: string;

    @IsNotEmpty()
    @IsInt()
    approved_by?: number; // relación con user.id

    @IsNotEmpty()
    @IsString()
    status?: string = 'active';

    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    pending_amount?: number;

    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    total_amount?: number;

    @IsNotEmpty()
    @IsString()
    payment_frecuency_id?: string;

    @IsNotEmpty()
    @IsString()
    warranty?: string;

}

export class LoanResponseDto {
    @Expose()
    readonly id: number;
  
    @Expose()
    readonly amount: number;
  
    @Expose()
    readonly status: string;
  
    @Expose()
    @Type(()=> ClientLoanDto)
    readonly client: ClientLoanDto | null;
  
    @Expose()
    @Type(()=> ApprovedByDto)
    readonly approved_by: ApprovedByDto | null;
  }

  export class ApprovedByDto{
    @Expose()
    readonly id: number;

    @Expose()
    readonly fullName: string;
  }

  export class ClientLoanDto{
    @Expose()
    readonly id: number;

    @Expose()
    readonly fullName: string;
    
    @Expose()
    readonly email: string;
    
    @Expose()
    readonly document_number: number;
  }