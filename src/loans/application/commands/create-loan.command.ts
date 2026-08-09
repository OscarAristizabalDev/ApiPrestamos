import { QuoteFrequency } from 'src/quotes/domain/enums/quote-frequency.enum';
import { QuoteAmortization } from 'src/quotes/domain/enums/quote-amortization.enum';
import { Quote } from 'src/quotes/domain/entities/quote.entity';
import { LoanType } from '../../domain/enums/loan-type.enum';
import { CustomerSnapshot } from '../../domain/entities/customer-snapshot.entity';
import { ProductSnapshot } from '../../domain/entities/product-snapshot.entity';

export class CreateLoanCommand {
  constructor(
    public readonly clientId: string,
    public readonly customerSnapshot: CustomerSnapshot,
    public readonly approvedBy: string,
    public readonly amount: number,
    public readonly loanType: LoanType,
    public readonly startDate: string,
    public readonly frequency: QuoteFrequency,
    public readonly numberQuotes: number,
    public readonly interestRate: number,
    public readonly amortization: QuoteAmortization,
    public readonly quotes: Quote[],
    public readonly productId: string | null = null,
    public readonly productSnapshot: ProductSnapshot | null = null,
    public readonly currency: string = 'COP',
  ) {}
}
