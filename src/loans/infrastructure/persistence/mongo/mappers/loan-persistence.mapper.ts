import { Types } from 'mongoose';
import { Loan } from 'src/loans/domain/entities/loan.entity';
import { CreateLoanCommand } from 'src/loans/application/commands/create-loan.command';
import { LoanDocument } from '../schemas/loan.schema';

// Shape of `client`/`approvedBy` once populated by Mongoose; kept local to avoid depending on other modules' schemas.
interface PopulatedParty {
    _id: Types.ObjectId;
    fullName: string;
    email?: string;
    documentNumber?: string;
}

export class LoanPersistenceMapper {

    static toCreateDoc(command: CreateLoanCommand): Record<string, unknown> {
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

    static toDomain(loan: LoanDocument): Loan {
        const client = loan.client as unknown as PopulatedParty | Types.ObjectId | null;
        const approvedBy = loan.approvedBy as unknown as PopulatedParty | Types.ObjectId | null;

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
            createdAt: (loan as any).createdAt,
            client: this.toParty(client),
            customerSnapshot: loan.customerSnapshot,
            productId: loan.product ? loan.product.toString() : null,
            productSnapshot: loan.productSnapshot ?? null,
            approvedBy: this.toParty(approvedBy),
        };
    }

    private static toParty(value: any): Loan['client'] {
        if (!value) return null;
        if (value instanceof Types.ObjectId || typeof value === 'string') {
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
