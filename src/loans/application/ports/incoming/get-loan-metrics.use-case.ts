import { LoanMetrics } from '../outgoing/loan-repository.port';
import { GetLoanMetricsCommand } from '../../commands/get-loan-metrics.command';

export interface GetLoanMetricsUseCase {

    get(command: GetLoanMetricsCommand): Promise<LoanMetrics>
}
