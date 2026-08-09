import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Loan } from 'src/loans/domain/entities/loan.entity';
import { CreateLoanCommand } from 'src/loans/application/commands/create-loan.command';
import { LoanRepositoryPort, PaginatedLoans } from 'src/loans/application/ports/outgoing/loan-repository.port';
import { LoanDocument, LoanSchemaClass } from './schemas/loan.schema';
import { ClientLookupDocument, ClientLookupSchemaClass } from './schemas/client-lookup.schema';
import { ProductLookupDocument, ProductLookupSchemaClass } from './schemas/product-lookup.schema';

// Shape of `client`/`approvedBy` once populated by Mongoose; kept local to avoid depending on other modules' schemas.
interface PopulatedParty {
    _id: Types.ObjectId;
    fullName: string;
    email?: string;
    documentNumber?: string;
}

@Injectable()
export class LoanRepository implements LoanRepositoryPort {

    constructor(
        @InjectModel(LoanSchemaClass.name) private readonly loanModel: Model<LoanDocument>,
        @InjectModel(ClientLookupSchemaClass.name) private readonly clientModel: Model<ClientLookupDocument>,
        @InjectModel(ProductLookupSchemaClass.name) private readonly productModel: Model<ProductLookupDocument>,
    ) {}

    async clientExists(clientId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(clientId)) return false;
        const client = await this.clientModel.exists({ _id: clientId, active: 1 });
        return !!client;
    }

    async productExists(productId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(productId)) return false;
        const product = await this.productModel.exists({ _id: productId, active: 1 });
        return !!product;
    }

    async create(command: CreateLoanCommand): Promise<Loan> {
        const created = await this.loanModel.create({
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
        });

        const populated = await created.populate([
            { path: 'client', select: 'fullName email documentNumber' },
            { path: 'approvedBy', select: 'fullName email' },
        ]);

        return this.toDomain(populated);
    }

    async findPaginated(page: number, limit: number): Promise<PaginatedLoans> {
        const skip = (page - 1) * limit;

        const [loans, total] = await Promise.all([
            this.loanModel
                .find()
                .populate('client', 'fullName email documentNumber')
                .populate('approvedBy', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.loanModel.countDocuments().exec(),
        ]);

        return {
            data: loans.map((loan) => this.toDomain(loan)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    private toDomain(loan: LoanDocument): Loan {
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

    private toParty(value: any): Loan['client'] {
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
