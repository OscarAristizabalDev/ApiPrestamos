import { Inject, Injectable } from '@nestjs/common';
import { GetLoanMetricsCommand } from '../commands/get-loan-metrics.command';
import { GetLoanMetricsUseCase } from '../ports/incoming/get-loan-metrics.use-case';
import { LOAN_REPOSITORY } from '../ports/outgoing/tokens';
import { LoanMetrics, LoanRepositoryPort } from '../ports/outgoing/loan-repository.port';

/** Solo el superadmin ve la colocación desagregada por asesor. */
const ADVISOR_DETAIL_ROLE = 'superadmin';

@Injectable()
export class GetLoanMetricsService implements GetLoanMetricsUseCase {

    constructor(
        @Inject(LOAN_REPOSITORY)
        private readonly loanRepository: LoanRepositoryPort,
    ) {}

    async get(command: GetLoanMetricsCommand): Promise<LoanMetrics> {
        return this.loanRepository.getMetrics({
            from: command.from,
            to: command.to,
            includeAdvisors: command.role === ADVISOR_DETAIL_ROLE,
        });
    }
}
