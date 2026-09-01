export class LoanMetricsBucketDto {
    key: string;
    count: number;
    amount: number;
}

export class LoanMetricsEntryDto {
    id: string;
    label: string;
    meta?: string;
    count: number;
    amount: number;
}

export class LoanMetricsMonthDto {
    month: string;
    count: number;
    amount: number;
}

export class LoanScheduleWindowDto {
    quotes: number;
    amount: number;
}

export class LoanMetricsTotalsDto {
    loans: number;
    placed: number;
    projectedInterest: number;
    receivable: number;
    averageTicket: number;
    averageRate: number;
    averageTerm: number;
}

export class LoanMetricsResponseDto {
    totals: LoanMetricsTotalsDto;
    byStatus: LoanMetricsBucketDto[];
    byType: LoanMetricsBucketDto[];
    monthly: LoanMetricsMonthDto[];
    schedule: {
        overdue: LoanScheduleWindowDto;
        next7: LoanScheduleWindowDto;
        next30: LoanScheduleWindowDto;
    };
    topProducts: LoanMetricsEntryDto[];
    topClients: LoanMetricsEntryDto[];
    byAdvisor: LoanMetricsEntryDto[];
}
