import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class CustomerSnapshotRequestDto {
    @ApiPropertyOptional({ description: 'Client id at snapshot time' })
    @IsOptional()
    @IsString()
    readonly id?: string;

    @ApiPropertyOptional({ example: 'Jane Doe' })
    @IsOptional()
    @IsString()
    readonly fullName?: string;

    @ApiProperty({ description: 'Identity document number', example: '1000000000' })
    @IsString()
    readonly documentNumber: string;

    @ApiProperty({ example: 'jane.doe@example.com' })
    @IsEmail()
    readonly email: string;

    @ApiProperty({ example: '3000000000' })
    @IsString()
    readonly phoneNumber: string;

    @ApiProperty({ example: 'Calle 1 # 2-3' })
    @IsString()
    readonly address: string;

    @ApiProperty({ example: 'EMPLOYED' })
    @IsString()
    readonly employmentStatus: string;

    @ApiPropertyOptional({ example: 'Acme S.A.S.' })
    @IsOptional()
    @IsString()
    readonly employerName?: string;

    @ApiProperty({ description: 'Declared monthly income', example: 3500000 })
    @IsNumber()
    readonly monthlyIncome: number;

    @ApiProperty({ example: 720 })
    @IsNumber()
    readonly creditScore: number;

    @ApiProperty({ example: 'LOW' })
    @IsString()
    readonly riskCategory: string;
}
