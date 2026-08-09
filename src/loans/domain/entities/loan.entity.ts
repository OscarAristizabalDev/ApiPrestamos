import { QuoteFrequency } from 'src/quotes/domain/enums/quote-frequency.enum';
import { QuoteAmortization } from 'src/quotes/domain/enums/quote-amortization.enum';
import { Quote } from 'src/quotes/domain/entities/quote.entity';
import { LoanStatus } from '../enums/loan-status.enum';
import { LoanType } from '../enums/loan-type.enum';
import { CustomerSnapshot } from './customer-snapshot.entity';
import { ProductSnapshot } from './product-snapshot.entity';

export class LoanParty {
    id: string;
    fullName: string;
    email?: string;
    documentNumber?: string;
}

export class Loan {
    id: string;
    amount: number;
    currency: string;
    interestRate: number;
    loanType: LoanType;
    startDate: Date;
    frequency: QuoteFrequency;
    numberQuotes: number;
    amortization: QuoteAmortization;
    quotes: Quote[];
    status: LoanStatus;
    client: LoanParty | null;
    customerSnapshot: CustomerSnapshot;
    productId: string | null;
    productSnapshot: ProductSnapshot | null;
    approvedBy: LoanParty | null;
    createdAt?: Date;
}
