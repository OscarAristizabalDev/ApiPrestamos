import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { Loan } from 'src/loans/domain/entities/loan.entity';
import { quotesMatchTerms } from 'src/loans/domain/policies/loan-schedule.policy';
import { CreateLoanCommand } from '../commands/create-loan.command';
import { CreateLoanUseCase } from '../ports/incoming/create-loan.use-case';
import { LOAN_REPOSITORY } from '../ports/outgoing/tokens';
import { LoanRepositoryPort } from '../ports/outgoing/loan-repository.port';

@Injectable()
export class CreateLoanService implements CreateLoanUseCase {

    constructor(
        @Inject(LOAN_REPOSITORY)
        private readonly loanRepository: LoanRepositoryPort,
    ) {}

    async create(command: CreateLoanCommand): Promise<Loan> {
        const clientExists = await this.loanRepository.clientExists(command.clientId);

        if (!clientExists) {
            throw new ConflictException('El Cliente no existe');
        }

        if (command.productId) {
            const productExists = await this.loanRepository.productExists(command.productId);

            if (!productExists) {
                throw new ConflictException('El Producto no existe');
            }
        }

        const terms = {
            amount: command.amount,
            startDate: new Date(command.startDate),
            numberQuotes: command.numberQuotes,
        };

        if (!quotesMatchTerms(terms, command.quotes)) {
            throw new BadRequestException('Las cuotas enviadas no corresponden a los términos del préstamo');
        }

        return this.loanRepository.create(command);
    }
}
