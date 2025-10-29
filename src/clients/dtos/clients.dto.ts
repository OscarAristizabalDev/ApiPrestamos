import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";


export class ListClientsDto{
    @IsOptional()
    @IsString()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    document_number: string;

    @Type(() => Number) // convierte string del body/query en number
    @IsInt({ message: 'La página debe ser un número entero' })
    @Min(1, { message: 'La página debe ser mayor o igual a 1' })
    page: number;

    @Type(() => Number)
    @IsInt({ message: 'El límite debe ser un número entero' })
    @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
    limit: number;
}

export class DocumentTypesDto{
    @Expose()
    readonly id: number;

    @Expose()
    readonly description: string;
}


export class CreateClientsDto{
    @IsNotEmpty()
    @IsString()
    names: string;

    @IsNotEmpty()
    @IsString()
    surnames: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    phone_number: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    birthdate: string;

    @IsNotEmpty()
    @IsNumber()
    type_document_id: number;

    @IsNotEmpty()
    @IsString()
    document_number: string;
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
    @ApiPropertyOptional({ description: 'Id del cliente', example: '1' })
    @IsOptional()
    @IsInt({message: ' value must be a Integer number'})
    @Min(1, { message: 'value must be greater than zero'})
    id: number;

    @ApiPropertyOptional({ description: 'Correo electrónico del cliente', example: 'miguel@example.com' })
    @IsOptional()
    @IsString()
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ description: 'Número de documento del cliente', example: '1234567890' })
    @IsOptional()
    @IsString()
    document: string;
}

export class UpdateClientsDto extends PartialType(CreateClientsDto){
}

