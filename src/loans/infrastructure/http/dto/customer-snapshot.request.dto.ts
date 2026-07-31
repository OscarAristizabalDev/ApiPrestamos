import { IsMongoId, IsNumber, IsString } from "class-validator";

export class CustomerSnapshotDto {

    @IsMongoId()
    id: string;

    @IsString()
    fullName: string;

    @IsString()
    documentNumber: string;

    @IsString()
    email: string;

    @IsString()
    phoneNumber: string;

    @IsString()
    address: string;

    @IsString()
    employmentStatus: string;

    @IsString()
    employerName: string;

    @IsNumber()
    monthlyIncome: number;

    @IsNumber()
    creditScore: number;

    @IsString()
    riskCategory: string;
}