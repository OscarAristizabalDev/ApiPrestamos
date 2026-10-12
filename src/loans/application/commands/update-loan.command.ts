import { LoanChanges } from '../../domain/entities/loan-changes.entity';

export class UpdateLoanCommand {
  constructor(
    public readonly loanId: string,
    public readonly actorId: string,
    public readonly actorRole: string,
    public readonly changes: LoanChanges,
  ) {}
}
