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

export class LoanResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ example: 2000000 })
    amount: number;

    @ApiProperty({ example: 'COP' })
    currency: string;

    @ApiProperty({ example: 0.02 })
    interestRate: number;

    @ApiProperty({ example: 'MONTHLY' })
    interestRateType: string;

    @ApiProperty({ example: 12 })
    term: number;

    @ApiProperty({ example: 'MONTHLY' })
    paymentFrequency: string;

    @ApiProperty({ example: 'FRENCH' })
    amortizationMethod: string;

    @ApiProperty({ example: '2026-01-15' })
    startDate: string;

    @ApiProperty({ example: 'PERSONAL' })
    loanType: string;

    @ApiProperty({ example: 'ACTIVE' })
    status: string;

    @ApiProperty({ required: false })
    warranty?: string;

    @ApiProperty({ type: LoanPartyResponseDto, nullable: true })
    client: LoanPartyResponseDto | null;

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
