import { ApiProperty } from '@nestjs/swagger';

export class LoanMetricsBucketDto {
    @ApiProperty({ description: 'Grouped value (loan status or loan type); UNKNOWN when missing', example: 'ACTIVE' })
    key: string;

    @ApiProperty({ description: 'Number of loans', example: 42 })
    count: number;

    @ApiProperty({ description: 'Placed principal, rounded to 2 decimals', example: 84000000 })
    amount: number;
}

export class LoanMetricsEntryDto {
    @ApiProperty({ description: 'Id of the product, client or advisor', example: '665f1c2e8b3a4d0012ab34cd' })
    id: string;

    @ApiProperty({ description: 'Display name', example: 'Jane Doe' })
    label: string;

    @ApiProperty({
        required: false,
        description: 'Secondary detail: product code, client document or advisor email',
        example: '1000000000',
    })
    meta?: string;

    @ApiProperty({ description: 'Number of loans', example: 3 })
    count: number;

    @ApiProperty({ description: 'Placed principal, rounded to 2 decimals', example: 12000000 })
    amount: number;
}

export class LoanMetricsMonthDto {
    @ApiProperty({ description: 'Month of the loan start date (YYYY-MM)', example: '2026-10' })
    month: string;

    @ApiProperty({ description: 'Number of loans', example: 8 })
    count: number;

    @ApiProperty({ description: 'Placed principal, rounded to 2 decimals', example: 16000000 })
    amount: number;
}

export class LoanScheduleWindowDto {
    @ApiProperty({ description: 'Number of quotes in the window', example: 15 })
    quotes: number;

    @ApiProperty({ description: 'Sum of the quotes total value, rounded to 2 decimals', example: 7500000 })
    amount: number;
}

export class LoanMetricsTotalsDto {
    @ApiProperty({ description: 'Number of loans', example: 120 })
    loans: number;

    @ApiProperty({ description: 'Sum of loan principal', example: 240000000 })
    placed: number;

    @ApiProperty({ description: 'Sum of the interest of every quote', example: 36000000 })
    projectedInterest: number;

    @ApiProperty({ description: 'Sum of the total value of every quote (principal + interest)', example: 276000000 })
    receivable: number;

    @ApiProperty({ description: 'Average loan principal', example: 2000000 })
    averageTicket: number;

    @ApiProperty({ description: 'Average interest rate per period, as a percentage', example: 2.5 })
    averageRate: number;

    @ApiProperty({ description: 'Average number of quotes per loan', example: 12 })
    averageTerm: number;
}

// Collection projection over ACTIVE loans only.
export class LoanMetricsScheduleDto {
    @ApiProperty({
        type: LoanScheduleWindowDto,
        description: 'Quotes whose due date already passed. There is no payment record, so they are not confirmed as unpaid',
    })
    overdue: LoanScheduleWindowDto;

    @ApiProperty({ type: LoanScheduleWindowDto, description: 'Quotes due in the next 7 days' })
    next7: LoanScheduleWindowDto;

    @ApiProperty({ type: LoanScheduleWindowDto, description: 'Quotes due in the next 30 days' })
    next30: LoanScheduleWindowDto;
}

export class LoanMetricsResponseDto {
    @ApiProperty({ type: LoanMetricsTotalsDto })
    totals: LoanMetricsTotalsDto;

    @ApiProperty({ type: [LoanMetricsBucketDto], description: 'Loans grouped by status' })
    byStatus: LoanMetricsBucketDto[];

    @ApiProperty({ type: [LoanMetricsBucketDto], description: 'Loans grouped by loan type' })
    byType: LoanMetricsBucketDto[];

    @ApiProperty({ type: [LoanMetricsMonthDto], description: 'Monthly placement, last 12 months with loans, oldest first' })
    monthly: LoanMetricsMonthDto[];

    @ApiProperty({ type: LoanMetricsScheduleDto })
    schedule: LoanMetricsScheduleDto;

    @ApiProperty({ type: [LoanMetricsEntryDto], description: 'Top 5 products by placed principal' })
    topProducts: LoanMetricsEntryDto[];

    @ApiProperty({ type: [LoanMetricsEntryDto], description: 'Top 5 clients by placed principal' })
    topClients: LoanMetricsEntryDto[];

    @ApiProperty({
        type: [LoanMetricsEntryDto],
        description: 'Top 5 advisors by placed principal; always empty unless the caller is a superadmin',
    })
    byAdvisor: LoanMetricsEntryDto[];
}
