import { ApiProperty } from '@nestjs/swagger';
import { LoanStatus } from 'src/loans/domain/enums/loan-status.enum';
import { LoanType } from 'src/loans/domain/enums/loan-type.enum';
import { QuoteFrequency } from 'src/quotes/domain/enums/quote-frequency.enum';
import { QuoteAmortization } from 'src/quotes/domain/enums/quote-amortization.enum';

export class LoanPartyResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    fullName: string;

    @ApiProperty({ required: false })
    email?: string;

    @ApiProperty({ required: false })
    documentNumber?: string;
}

export class CustomerSnapshotResponseDto {
    @ApiProperty({ required: false })
    id?: string;

    @ApiProperty({ required: false })
    fullName?: string;

    @ApiProperty()
    documentNumber: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    phoneNumber: string;

    @ApiProperty()
    address: string;

    @ApiProperty()
    employmentStatus: string;

    @ApiProperty({ required: false })
    employerName?: string;

    @ApiProperty()
    monthlyIncome: number;

    @ApiProperty()
    creditScore: number;

    @ApiProperty()
    riskCategory: string;
}

export class ProductSnapshotResponseDto {
    @ApiProperty({ required: false })
    id?: string;

    @ApiProperty()
    code: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ required: false })
    brand?: string;

    @ApiProperty({ required: false })
    model?: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty()
    salePrice: number;

    @ApiProperty({ required: false })
    imageUrl?: string;
}

export class LoanQuoteResponseDto {
    @ApiProperty({ example: 1 })
    number: number;

    @ApiProperty({ example: 2000 })
    value: number;

    @ApiProperty({ example: 500 })
    interestValue: number;

    @ApiProperty({ example: 2500 })
    totalValue: number;

    @ApiProperty({
        example: '2026-01-15T00:00:00.000Z',
        description: 'Expiration date in ISO-8601 format',
    })
    expirationDate: string;
}

export class LoanResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ example: 2000000 })
    amount: number;

    @ApiProperty({ example: 'COP' })
    currency: string;

    @ApiProperty({ example: 2.5, description: 'Interest rate per period, as a percentage' })
    interestRate: number;

    @ApiProperty({ enum: LoanType, example: LoanType.CASH })
    loanType: string;

    @ApiProperty({ example: '2026-01-15T00:00:00.000Z', description: 'Start date in ISO-8601 format' })
    startDate: string;

    @ApiProperty({ enum: QuoteFrequency, example: QuoteFrequency.MONTHLY })
    frequency: string;

    @ApiProperty({ example: 12 })
    numberQuotes: number;

    @ApiProperty({ enum: QuoteAmortization, example: QuoteAmortization.FRENCH })
    amortization: string;

    @ApiProperty({ type: [LoanQuoteResponseDto] })
    quotes: LoanQuoteResponseDto[];

    @ApiProperty({ enum: LoanStatus, example: LoanStatus.ACTIVE })
    status: string;

    @ApiProperty({ type: LoanPartyResponseDto, nullable: true })
    client: LoanPartyResponseDto | null;

    @ApiProperty({ type: CustomerSnapshotResponseDto })
    customerSnapshot: CustomerSnapshotResponseDto;

    @ApiProperty({ required: false, nullable: true })
    productId: string | null;

    @ApiProperty({ type: ProductSnapshotResponseDto, nullable: true, required: false })
    productSnapshot: ProductSnapshotResponseDto | null;

    @ApiProperty({ type: LoanPartyResponseDto, nullable: true })
    approvedBy: LoanPartyResponseDto | null;
}

export class PaginatedLoanResponseDto {
    @ApiProperty({ type: [LoanResponseDto] })
    data: LoanResponseDto[];

    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    totalPages: number;
}
