import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Loan } from 'src/loans/domain/entities/loan.entity';
import { CreateLoanCommand } from 'src/loans/application/commands/create-loan.command';
import { LoanRepositoryPort, PaginatedLoans } from 'src/loans/application/ports/outgoing/loan-repository.port';
import { LoanDocument, LoanSchemaClass } from './schemas/loan.schema';
import { ClientLookupDocument, ClientLookupSchemaClass } from './schemas/client-lookup.schema';
import { ProductLookupDocument, ProductLookupSchemaClass } from './schemas/product-lookup.schema';
import { LoanPersistenceMapper } from './mappers/loan-persistence.mapper';

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
        const created = await this.loanModel.create(LoanPersistenceMapper.toCreateDoc(command));

        const populated = await created.populate([
            { path: 'client', select: 'fullName email documentNumber' },
            { path: 'approvedBy', select: 'fullName email' },
        ]);

        return LoanPersistenceMapper.toDomain(populated);
    }

    async findPaginated(page: number, limit: number, search?: string): Promise<PaginatedLoans> {
        const skip = (page - 1) * limit;
        const filter = this.buildSearchFilter(search);

        const [loans, total] = await Promise.all([
            this.loanModel
                .find(filter)
                .populate('client', 'fullName email documentNumber')
                .populate('approvedBy', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.loanModel.countDocuments(filter).exec(),
        ]);

        return {
            data: loans.map((loan) => LoanPersistenceMapper.toDomain(loan)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    private buildSearchFilter(search?: string): Record<string, unknown> {
        if (!search) return {};

        const sanitized = this.escapeRegExp(search);
        return {
            $or: [
                { 'customerSnapshot.fullName': { $regex: sanitized, $options: 'i' } },
                { 'customerSnapshot.documentNumber': { $regex: sanitized, $options: 'i' } },
            ],
        };
    }

    private escapeRegExp(text: string): string {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
