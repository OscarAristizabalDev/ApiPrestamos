import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { canModifyOwned } from 'src/auth/ownership';
import { CALCULATE_QUOTE_USE_CASE } from 'src/quotes/application/ports/incoming/tokens';
import { CalculateQuoteUseCase } from 'src/quotes/application/ports/incoming/calculate-quote.use-case';
import { CalculateQuoteCommand } from 'src/quotes/application/commands/calculate-quote.command';
import { Quote } from 'src/quotes/domain/entities/quote.entity';
import { Loan } from 'src/loans/domain/entities/loan.entity';
import { LoanChanges } from 'src/loans/domain/entities/loan-changes.entity';
import {
    assertLoanEditable,
    changedFields,
    requiresScheduleRecalculation,
} from 'src/loans/domain/policies/loan-edit.policy';
import { UpdateLoanCommand } from '../commands/update-loan.command';
import { UpdateLoanUseCase } from '../ports/incoming/update-loan.use-case';
import { LOAN_REPOSITORY } from '../ports/outgoing/tokens';
import { LoanRepositoryPort } from '../ports/outgoing/loan-repository.port';

@Injectable()
export class UpdateLoanService implements UpdateLoanUseCase {

    constructor(
        @Inject(LOAN_REPOSITORY)
        private readonly loanRepository: LoanRepositoryPort,
        @Inject(CALCULATE_QUOTE_USE_CASE)
        private readonly calculateQuoteUseCase: CalculateQuoteUseCase,
    ) {}

    async update(command: UpdateLoanCommand): Promise<Loan> {
        const loan = await this.loanRepository.findById(command.loanId);

        if (!loan) {
            throw new NotFoundException('El préstamo no existe');
        }

        // The advisor who registered the loan (approvedBy) owns it.
        const actor = { id: command.actorId, role: command.actorRole };
        if (!canModifyOwned(actor, loan.approvedBy?.id)) {
            throw new ForbiddenException('No tienes permiso para editar este préstamo');
        }

        assertLoanEditable(loan);

        const fields = changedFields(loan, command.changes);
        if (fields.length === 0) {
            return loan;
        }

        // Persist only the fields that actually differ from the current loan.
        const changes = Object.fromEntries(
            fields.map((field) => [field, command.changes[field]]),
        ) as LoanChanges;

        const quotes = requiresScheduleRecalculation(loan, changes)
            ? await this.recalculateQuotes(loan, changes)
            : null;

        const updated = await this.loanRepository.update(loan.id, changes, quotes);

        if (!updated) {
            throw new ConflictException('El préstamo cambió de estado y ya no se puede editar');
        }

        return updated;
    }

    private recalculateQuotes(loan: Loan, changes: LoanChanges): Promise<Quote[]> {
        const startDate = changes.startDate ?? loan.startDate;

        return this.calculateQuoteUseCase.calculate(new CalculateQuoteCommand(
            changes.amount ?? loan.amount,
            changes.frequency ?? loan.frequency,
            changes.numberQuotes ?? loan.numberQuotes,
            changes.interestRate ?? loan.interestRate,
            changes.amortization ?? loan.amortization,
            startDate.toISOString(),
        ));
    }
}
