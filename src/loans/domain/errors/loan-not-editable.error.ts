import { LoanStatus } from '../enums/loan-status.enum';

export class LoanNotEditableError extends Error {
    constructor(
        public readonly loanId: string,
        public readonly status: LoanStatus,
    ) {
        super(`Loan ${loanId} cannot be edited while in status ${status}`);
        this.name = 'LoanNotEditableError';
    }
}
