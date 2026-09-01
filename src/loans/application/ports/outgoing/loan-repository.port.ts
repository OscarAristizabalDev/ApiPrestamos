import { Loan } from 'src/loans/domain/entities/loan.entity';
import { CreateLoanCommand } from '../../commands/create-loan.command';

export interface PaginatedLoans {
    data: Loan[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/** Agrupación por un valor cerrado del dominio (estado, tipo de préstamo). */
export interface LoanMetricsBucket {
    key: string;
    count: number;
    amount: number;
}

/** Agrupación por una entidad relacionada (producto, cliente, asesor). */
export interface LoanMetricsEntry {
    id: string;
    label: string;
    meta?: string;
    count: number;
    amount: number;
}

export interface LoanMetricsMonth {
    /** `YYYY-MM` de la fecha de inicio del préstamo. */
    month: string;
    count: number;
    amount: number;
}

export interface LoanScheduleWindow {
    quotes: number;
    amount: number;
}

/**
 * Métricas de **colocación y proyección de cobro**. No hay registro de pagos en
 * el sistema, así que `schedule.overdue` son cuotas cuya fecha ya pasó, no
 * necesariamente impagas: es una señal a conciliar, no mora confirmada.
 */
export interface LoanMetrics {
    totals: {
        loans: number;
        placed: number;
        projectedInterest: number;
        receivable: number;
        averageTicket: number;
        averageRate: number;
        averageTerm: number;
    };
    byStatus: LoanMetricsBucket[];
    byType: LoanMetricsBucket[];
    monthly: LoanMetricsMonth[];
    schedule: {
        overdue: LoanScheduleWindow;
        next7: LoanScheduleWindow;
        next30: LoanScheduleWindow;
    };
    topProducts: LoanMetricsEntry[];
    topClients: LoanMetricsEntry[];
    /** Vacío salvo para quien puede ver la colocación por asesor. */
    byAdvisor: LoanMetricsEntry[];
}

export interface LoanMetricsFilter {
    from?: Date;
    to?: Date;
    includeAdvisors: boolean;
}

export interface LoanRepositoryPort {
    create(command: CreateLoanCommand): Promise<Loan>;
    findPaginated(page: number, limit: number, search?: string): Promise<PaginatedLoans>;
    getMetrics(filter: LoanMetricsFilter): Promise<LoanMetrics>;
    clientExists(clientId: string): Promise<boolean>;
    productExists(productId: string): Promise<boolean>;
}
