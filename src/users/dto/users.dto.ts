import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateUserDto {
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
    @IsNotEmpty()
    @IsString()
    names: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    surnames: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    city?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    status?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    postalCode?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsDateString()
    birthdate: Date;

    @ApiProperty()
    @IsOptional()
    @IsString()
    role?: string;
}

export class UserResponseDto {
    @ApiProperty()
    readonly email: string;

    @ApiProperty()
    readonly names: string;

    @ApiProperty()
    readonly surnames: string;

    @ApiProperty()
    readonly phoneNumber?: string;

    @ApiProperty()
    readonly city?: string;

    @ApiProperty()
    readonly role: string;
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


