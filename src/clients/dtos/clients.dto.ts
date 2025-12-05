import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsDate, IsEmail, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { Types } from "mongoose";


export class ListClientsDto{
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    documentNumber?: string;

    @Type(() => Number) // convierte string del body/query en number
    @IsInt({ message: 'La página debe ser un número entero' })
    @Min(1, { message: 'La página debe ser mayor o igual a 1' })
    page: number;

    @Type(() => Number)
    @IsInt({ message: 'El límite debe ser un número entero' })
    @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
    limit: number;
}
export class CreateClientsDto{

    @IsOptional()
    @IsString()
    id?: string;

    @IsNotEmpty()
    @IsString()
    names: string;

    @IsNotEmpty()
    @IsString()
    surnames: string;

    @IsOptional()
    @IsString()
    fullName: string;

    @ApiProperty()
    @Type(() => Date)
    @IsNotEmpty()
    @IsDate()
    registrationDate: Date;

    @ApiProperty()
    @Type(() => Date)
    @IsNotEmpty()
    @IsDate()
    birthdate: Date;

    @IsNotEmpty()
    @IsString()
    typeDocument: number;

    @IsNotEmpty()
    @IsString()
    documentNumber: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    employmentStatus: string;

    @IsNotEmpty()
    @IsString()
    employerName: string;

    @IsNotEmpty()
    @IsNumber()
    monthlyIncome: string;

    @IsNotEmpty()
    @IsNumber()
    @IsInt()
    creditScore: string;

    @IsNotEmpty()
    @IsString()
    riskCategory: string;

    @IsNotEmpty()
    @IsString()
    notes: string;

    @IsNotEmpty()
    @IsInt()
    @Min(0, { message: 'Value must be greater or equal to 0' })
    @Max(3, { message: 'Value must be less or equal to 3' })
    active: string;
}

export class ResponseClientsDto{
    @Expose()
    readonly names: string;
    @Expose()
    readonly surnames: string;
    @Expose()
    readonly email: string;
}

export class FindOneClientDto{
    @ApiPropertyOptional({ description: 'Client ID', example: '1' })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiPropertyOptional({ description: 'Client FullName', example: 'Adolf F Kennedy' })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiPropertyOptional({ description: 'Client ID number', example: '1234567890' })
    @IsOptional()
    @IsString()
    documentNumber?: string;

    @ApiPropertyOptional({ description: 'Client email', example: '1234567890' })
    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;
}

export class FoundClientDto {
    @Expose()
    readonly id: string | Types.ObjectId | unknown;
    @Expose()
    readonly names: string;
    @Expose()
    readonly surnames: string;
    @Expose()
    readonly fullName: string;
    @Expose()
    readonly email: string;
    @Expose()
    readonly phoneNumber: string;
    @Expose()
    readonly address: string;
    @Expose()
    readonly birthdate: string;
    @Expose()
    readonly typeDocument: string;
    @Expose()
    readonly documentNumber: string;
    @Expose()
    readonly employmentStatus: string;
    @Expose()
    readonly employerName: string;
    @Expose()
    readonly monthlyIncome: number;
    @Expose()
    readonly creditScore: number;
    @Expose()
    readonly riskCategory: string;
    @Expose()
    readonly notes: string;
}

export class UpdateClientsDto extends PartialType(CreateClientsDto){
}

