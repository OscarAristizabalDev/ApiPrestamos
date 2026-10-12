import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { canModifyOwned } from 'src/auth/ownership';
import { Loan } from 'src/loans/domain/entities/loan.entity';
import { LoanChanges } from 'src/loans/domain/entities/loan-changes.entity';
import {
    assertLoanEditable,
    changedFields,
    requiresScheduleRecalculation,
} from 'src/loans/domain/policies/loan-edit.policy';
import { ScheduleTerms, quotesMatchTerms } from 'src/loans/domain/policies/loan-schedule.policy';
import { UpdateLoanCommand } from '../commands/update-loan.command';
import { UpdateLoanUseCase } from '../ports/incoming/update-loan.use-case';
import { LOAN_REPOSITORY } from '../ports/outgoing/tokens';
import { LoanRepositoryPort } from '../ports/outgoing/loan-repository.port';

@Injectable()
export class UpdateLoanService implements UpdateLoanUseCase {

    constructor(
        @Inject(LOAN_REPOSITORY)
        private readonly loanRepository: LoanRepositoryPort,
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

        // Quotes are only replaced when a schedule term changed; otherwise the current schedule stays.
        const scheduleChanged = requiresScheduleRecalculation(loan, changes);
        if (scheduleChanged && !command.quotes?.length) {
            throw new BadRequestException('Debes enviar las cuotas recalculadas para los nuevos términos del préstamo');
        }
        const quotes = scheduleChanged ? command.quotes : null;

        if (quotes && !quotesMatchTerms(this.mergeTerms(loan, changes), quotes)) {
            throw new BadRequestException('Las cuotas enviadas no corresponden a los términos del préstamo');
        }

        const updated = await this.loanRepository.update(loan.id, changes, quotes);

        if (!updated) {
            throw new ConflictException('El préstamo cambió de estado y ya no se puede editar');
        }

        return updated;
    }

    // Terms the loan will have once the changes are applied.
    private mergeTerms(loan: Loan, changes: LoanChanges): ScheduleTerms {
        return {
            amount: changes.amount ?? loan.amount,
            startDate: changes.startDate ?? loan.startDate,
            numberQuotes: changes.numberQuotes ?? loan.numberQuotes,
        };
    }
}
