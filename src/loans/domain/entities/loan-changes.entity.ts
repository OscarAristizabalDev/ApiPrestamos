import { Loan } from './loan.entity';

// Loan terms that can be modified after the loan is created.
export type EditableLoanField =
    | 'amount'
    | 'currency'
    | 'interestRate'
    | 'startDate'
    | 'frequency'
    | 'numberQuotes'
    | 'amortization';

// Partial update of a loan: only the provided fields are changed.
export type LoanChanges = Partial<Pick<Loan, EditableLoanField>>;
