import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsDate, IsEmail, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Length, Min } from "class-validator";
import { Types } from "mongoose";

export class SearchTerms{
    @Type(() => Number) // convierte string del body/query en number
    @IsInt({ message: 'La página debe ser un número entero' })
    @Min(1, { message: 'La página debe ser mayor o igual a 1' })
    id?: string;

    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    fullName?: string;
}
export class ListUsersDto{
    @IsOptional()
    @IsObject()
    @Type(() => SearchTerms)
    terms?: SearchTerms;

    @Type(() => Number) // convierte string del body/query en number
    @IsInt({ message: 'La página debe ser un número entero' })
    @Min(1, { message: 'La página debe ser mayor o igual a 1' })
    page: number;

    @Type(() => Number)
    @IsInt({ message: 'El límite debe ser un número entero' })
    @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
    limit: number;
}

export class CreateUserDto {
    
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    names: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    surnames: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiProperty()
    @Type(() => Date)
    @IsNotEmpty()
    @IsDate()
    registrationDate: Date;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Length(8, 32)
    password: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    phoneNumber?: string;
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty()
    @Type(() => Date)
    @IsNotEmpty()
    @IsDate()
    birthdate: Date;

    @ApiProperty()
    @IsOptional()
    @IsString()
    refreshToken?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    status?: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    active?: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    role?: string;
}

export class UserResponseDto {
    @ApiProperty()
    @Expose()
    readonly id: string;

    @ApiProperty()
    @Expose()
    readonly email: string;

    @ApiProperty()
    @Expose()
    readonly names: string;

    @ApiProperty()
    @Expose()
    readonly surnames: string;

    @ApiProperty()
    @Expose()
    readonly phoneNumber?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class LoginDto {
    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class FoundUserDto{
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
    readonly registrationDate: string;
    @Expose()
    readonly role: string;
}

export class AuthResponseDto {
    @IsNotEmpty()
    @IsString()
    accessToken: string;

    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}

export class RefreshTokenDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}


