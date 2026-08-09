import { ApiProperty } from '@nestjs/swagger';

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
        example: '2026-01-15',
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

    @ApiProperty({ example: 0.02 })
    interestRate: number;

    @ApiProperty({ example: 'CASH' })
    loanType: string;

    @ApiProperty({ example: '2026-01-15' })
    startDate: string;

    @ApiProperty({ example: 'MONTHLY' })
    frequency: string;

    @ApiProperty({ example: 12 })
    numberQuotes: number;

    @ApiProperty({ example: 'FRENCH' })
    amortization: string;

    @ApiProperty({ type: [LoanQuoteResponseDto] })
    quotes: LoanQuoteResponseDto[];

    @ApiProperty({ example: 'ACTIVE' })
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
