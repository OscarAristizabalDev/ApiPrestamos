import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsMongoId,
    IsNumber,
    IsOptional,
    IsPositive,
    ValidateNested,
} from 'class-validator';
import { LoanType } from 'src/loans/domain/enums/loan-type.enum';
import { QuoteFrequency } from 'src/quotes/domain/enums/quote-frequency.enum';
import { QuoteAmortization } from 'src/quotes/domain/enums/quote-amortization.enum';
import { CustomerSnapshotRequestDto } from './customer-snapshot.request.dto';
import { ProductSnapshotRequestDto } from './product-snapshot.request.dto';
import { LoanQuoteRequestDto } from './loan-quote.request.dto';

export class CreateLoanRequestDto {

    @ApiProperty({ description: 'Client id (Mongo ObjectId)', example: '665f1c2e8b3a4d0012ab34cd' })
    @IsMongoId()
    readonly customerId: string;

    @ApiProperty({ type: () => CustomerSnapshotRequestDto, description: 'Client data frozen at loan creation' })
    @ValidateNested()
    @Type(() => CustomerSnapshotRequestDto)
    readonly customerSnapshot: CustomerSnapshotRequestDto;

    @ApiPropertyOptional({ description: 'Financed product id; only for PRODUCT loans', example: '665f1c2e8b3a4d0012ab34ef' })
    @IsOptional()
    @IsMongoId()
    readonly productId?: string;

    @ApiPropertyOptional({ type: () => ProductSnapshotRequestDto, description: 'Product data frozen at loan creation' })
    @IsOptional()
    @ValidateNested()
    @Type(() => ProductSnapshotRequestDto)
    readonly productSnapshot?: ProductSnapshotRequestDto;

    @ApiProperty({ description: 'Loan principal, up to 2 decimals', example: 5000000 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    readonly amount: number;

    @ApiProperty({ enum: LoanType, description: 'Cash loan or product financing' })
    @IsEnum(LoanType)
    readonly loanType: LoanType;

    @ApiProperty({ description: 'ISO-8601 start date; must match the one sent to POST /quotes/calculate', example: '2026-11-01' })
    @IsDateString()
    readonly startDate: string;

    @ApiProperty({ enum: QuoteFrequency, description: 'Payment frequency' })
    @IsEnum(QuoteFrequency)
    readonly frequency: QuoteFrequency;

    @ApiProperty({ description: 'Number of quotes in the schedule', example: 12 })
    @IsInt()
    @IsPositive()
    readonly numberQuotes: number;

    @ApiProperty({ description: 'Interest rate per period, as a percentage', example: 2.5 })
    @IsNumber({ maxDecimalPlaces: 4 })
    @IsPositive()
    readonly interestRate: number;

    @ApiProperty({ enum: QuoteAmortization, description: 'Amortization system' })
    @IsEnum(QuoteAmortization)
    readonly amortization: QuoteAmortization;

    @ApiProperty({ type: () => [LoanQuoteRequestDto], description: 'Schedule from POST /quotes/calculate; must match the loan terms' })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => LoanQuoteRequestDto)
    readonly quotes: LoanQuoteRequestDto[];
}
