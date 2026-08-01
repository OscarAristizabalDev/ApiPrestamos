import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ListLoansCommand } from '../commands/list-loans.command';
import { ListLoansUseCase } from '../ports/incoming/list-loans.use-case';
import { LOAN_REPOSITORY } from '../ports/outgoing/tokens';
import { LoanRepositoryPort, PaginatedLoans } from '../ports/outgoing/loan-repository.port';

@Injectable()
export class ListLoansService implements ListLoansUseCase {

    private readonly defaultLimit: number;

    constructor(
        private readonly config: ConfigService,
        @Inject(LOAN_REPOSITORY)
        private readonly loanRepository: LoanRepositoryPort,
    ) {
        this.defaultLimit = +this.config.get<number>('PAGINATION_LIMIT', 10);
    }

    async list(command: ListLoansCommand): Promise<PaginatedLoans> {
        const limit = command.limit ?? this.defaultLimit;
        return this.loanRepository.findPaginated(command.page, limit);
    }
}
