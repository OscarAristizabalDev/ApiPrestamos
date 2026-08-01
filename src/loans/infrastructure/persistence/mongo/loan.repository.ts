import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Loan } from 'src/loans/domain/entities/loan.entity';
import { Client, ClientDocument } from 'src/clients/schemas/client.schema';
import { CreateLoanCommand } from 'src/loans/application/commands/create-loan.command';
import { LoanRepositoryPort, PaginatedLoans } from 'src/loans/application/ports/outgoing/loan-repository.port';
import { LoanDocument, LoanSchemaClass } from './schemas/loan.schema';

@Injectable()
export class LoanRepository implements LoanRepositoryPort {

    constructor(
        @InjectModel(LoanSchemaClass.name) private readonly loanModel: Model<LoanDocument>,
        @InjectModel(Client.name) private readonly clientModel: Model<ClientDocument>,
    ) {}

    async clientExists(clientId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(clientId)) return false;
        const client = await this.clientModel.exists({ _id: clientId, active: 1 });
        return !!client;
    }

    async create(command: CreateLoanCommand): Promise<Loan> {
        const created = await this.loanModel.create({
            client: new Types.ObjectId(command.clientId),
            approvedBy: new Types.ObjectId(command.approvedBy),
            amount: command.amount,
            currency: command.currency,
            interestRate: command.interestRate,
            interestRateType: command.interestRateType,
            term: command.term,
            paymentFrequency: command.paymentFrequency,
            amortizationMethod: command.amortizationMethod,
            startDate: new Date(command.startDate),
            loanType: command.loanType,
            warranty: command.warranty,
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
        const client = loan.client as unknown as ClientDocument | Types.ObjectId | null;
        const approvedBy = loan.approvedBy as unknown as ClientDocument | Types.ObjectId | null;

        return {
            id: loan._id.toString(),
            amount: loan.amount,
            currency: loan.currency,
            interestRate: loan.interestRate,
            interestRateType: loan.interestRateType,
            term: loan.term,
            paymentFrequency: loan.paymentFrequency,
            amortizationMethod: loan.amortizationMethod,
            startDate: loan.startDate,
            loanType: loan.loanType,
            status: loan.status,
            warranty: loan.warranty,
            createdAt: (loan as any).createdAt,
            client: this.toParty(client),
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
