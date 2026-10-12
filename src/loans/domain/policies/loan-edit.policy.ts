import { Loan } from '../entities/loan.entity';
import { EditableLoanField, LoanChanges } from '../entities/loan-changes.entity';
import { LoanStatus } from '../enums/loan-status.enum';
import { LoanNotEditableError } from '../errors/loan-not-editable.error';

// Closed loans (paid, defaulted, cancelled) keep their terms as a historical record.
export const EDITABLE_LOAN_STATUSES: readonly LoanStatus[] = [LoanStatus.ACTIVE];

// Fields that change the payment schedule; currency is descriptive only.
export const SCHEDULE_AFFECTING_FIELDS: readonly EditableLoanField[] = [
    'amount',
    'interestRate',
    'startDate',
    'frequency',
    'numberQuotes',
    'amortization',
];

export function isLoanEditable(loan: Pick<Loan, 'status'>): boolean {
    return EDITABLE_LOAN_STATUSES.includes(loan.status);
}

export function assertLoanEditable(loan: Pick<Loan, 'id' | 'status'>): void {
    if (!isLoanEditable(loan)) {
        throw new LoanNotEditableError(loan.id, loan.status);
    }
}

export function hasChanges(loan: Loan, changes: LoanChanges): boolean {
    return changedFields(loan, changes).length > 0;
}

export function requiresScheduleRecalculation(loan: Loan, changes: LoanChanges): boolean {
    return changedFields(loan, changes).some((field) => SCHEDULE_AFFECTING_FIELDS.includes(field));
}

// Fields whose new value differs from the current one; undefined means "not provided".
export function changedFields(loan: Loan, changes: LoanChanges): EditableLoanField[] {
    return (Object.keys(changes) as EditableLoanField[]).filter((field) => {
        const next = changes[field];
        if (next === undefined) return false;
        const current = loan[field];
        if (next instanceof Date && current instanceof Date) {
            return next.getTime() !== current.getTime();
        }
        return next !== current;
    });
}
