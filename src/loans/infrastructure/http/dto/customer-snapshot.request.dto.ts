import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class CustomerSnapshotRequestDto {
    @IsOptional()
    @IsString()
    readonly id?: string;

    @IsOptional()
    @IsString()
    readonly fullName?: string;

    @IsString()
    readonly documentNumber: string;

    @IsEmail()
    readonly email: string;

    @IsString()
    readonly phoneNumber: string;

    @IsString()
    readonly address: string;

    @IsString()
    readonly employmentStatus: string;

    @IsOptional()
    @IsString()
    readonly employerName?: string;

    @IsNumber()
    readonly monthlyIncome: number;

    @IsNumber()
    readonly creditScore: number;

    @IsString()
    readonly riskCategory: string;
}
