import { Types } from 'mongoose';
import { QuoteFrequency } from 'src/quotes/domain/enums/quote-frequency.enum';
import { QuoteAmortization } from 'src/quotes/domain/enums/quote-amortization.enum';
import { Loan, LoanParty } from 'src/loans/domain/entities/loan.entity';
import { LoanChanges } from 'src/loans/domain/entities/loan-changes.entity';
import { Quote } from 'src/quotes/domain/entities/quote.entity';
import { LoanType } from 'src/loans/domain/enums/loan-type.enum';
import { CreateLoanCommand } from 'src/loans/application/commands/create-loan.command';
import {
    CustomerSnapshotSchemaClass,
    LoanDocument,
    LoanQuoteSchemaClass,
    ProductSnapshotSchemaClass,
} from '../schemas/loan.schema';

// Shape of `client`/`approvedBy` once populated by Mongoose; kept local to avoid depending on other modules' schemas.
interface PopulatedParty {
    _id: Types.ObjectId;
    fullName: string;
    email?: string;
    documentNumber?: string;
}

type PartyReference = PopulatedParty | Types.ObjectId | null;

// Mirrors the persisted document shape (`LoanSchemaClass`), not the incoming command.
interface CreateLoanDoc {
    client: Types.ObjectId;
    customerSnapshot: CustomerSnapshotSchemaClass;
    approvedBy: Types.ObjectId;
    product: Types.ObjectId | null;
    productSnapshot: ProductSnapshotSchemaClass | null;
    amount: number;
    currency: string;
    interestRate: number;
    loanType: LoanType;
    startDate: Date;
    frequency: QuoteFrequency;
    numberQuotes: number;
    amortization: QuoteAmortization;
    quotes: LoanQuoteSchemaClass[];
}

// Partial `$set` payload: only edited terms, plus the schedule when it was recalculated.
type UpdateLoanDoc = LoanChanges & { quotes?: LoanQuoteSchemaClass[] };

export class LoanPersistenceMapper {

    static toCreateDoc(command: CreateLoanCommand): CreateLoanDoc {
        return {
            client: new Types.ObjectId(command.clientId),
            customerSnapshot: command.customerSnapshot,
            approvedBy: new Types.ObjectId(command.approvedBy),
            product: command.productId ? new Types.ObjectId(command.productId) : null,
            productSnapshot: command.productSnapshot,
            amount: command.amount,
            currency: command.currency,
            interestRate: command.interestRate,
            loanType: command.loanType,
            startDate: new Date(command.startDate),
            frequency: command.frequency,
            numberQuotes: command.numberQuotes,
            amortization: command.amortization,
            quotes: command.quotes,
        };
    }

    static toUpdateDoc(changes: LoanChanges, quotes: Quote[] | null): UpdateLoanDoc {
        return {
            ...changes,
            ...(quotes ? { quotes } : {}),
        };
    }

    static toDomain(loan: LoanDocument): Loan {
        const client = loan.client as unknown as PartyReference;
        const approvedBy = loan.approvedBy as unknown as PartyReference;

        return {
            id: loan._id.toString(),
            amount: loan.amount,
            currency: loan.currency,
            interestRate: loan.interestRate,
            loanType: loan.loanType,
            startDate: loan.startDate,
            frequency: loan.frequency,
            numberQuotes: loan.numberQuotes,
            amortization: loan.amortization,
            quotes: loan.quotes,
            status: loan.status,
            createdAt: loan.createdAt,
            client: this.toParty(client),
            customerSnapshot: loan.customerSnapshot,
            productId: loan.product ? loan.product.toString() : null,
            productSnapshot: loan.productSnapshot ?? null,
            approvedBy: this.toParty(approvedBy),
        };
    }

    private static toParty(value: PartyReference): LoanParty | null {
        if (!value) return null;
        if (value instanceof Types.ObjectId) {
            return { id: value.toString(), fullName: '' };
        }
        return {
            id: value._id.toString(),
            fullName: value.fullName,
            email: value.email,
            documentNumber: value.documentNumber,
        };
    }
}
