import { Quote } from 'src/quotes/domain/entities/quote.entity';
import { LoanChanges } from '../../domain/entities/loan-changes.entity';

export class UpdateLoanCommand {
  constructor(
    public readonly loanId: string,
    public readonly actorId: string,
    public readonly actorRole: string,
    public readonly changes: LoanChanges,
    // Schedule calculated by the client through the quotes endpoint, as in loan creation.
    public readonly quotes: Quote[] | null = null,
  ) {}
}
