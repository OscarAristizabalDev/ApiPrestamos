import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Loan } from 'src/loans/domain/entities/loan.entity';
import { CreateLoanCommand } from 'src/loans/application/commands/create-loan.command';
import { LoanStatus } from 'src/loans/domain/enums/loan-status.enum';
import {
    LoanMetrics,
    LoanMetricsEntry,
    LoanMetricsFilter,
    LoanRepositoryPort,
    PaginatedLoans,
} from 'src/loans/application/ports/outgoing/loan-repository.port';
import { LoanDocument, LoanSchemaClass } from './schemas/loan.schema';
import { ClientLookupDocument, ClientLookupSchemaClass } from './schemas/client-lookup.schema';
import { ProductLookupDocument, ProductLookupSchemaClass } from './schemas/product-lookup.schema';
import { LoanPersistenceMapper } from './mappers/loan-persistence.mapper';


const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** Meses que se devuelven en la serie de colocación. */
const MONTHS_IN_SERIES = 12;

/** Filas que se devuelven en cada ranking (productos, clientes, asesores). */
const RANKING_SIZE = 5;

/** Forma cruda de cada rama del `$facet`; se normaliza antes de salir del repositorio. */
interface RawTotals {
    loans: number;
    placed: number;
    projectedInterest: number;
    receivable: number;
    averageTicket: number;
    averageRate: number;
    averageTerm: number;
}

interface RawBucket {
    _id: string | null;
    count: number;
    amount: number;
}

interface RawEntry {
    _id: Types.ObjectId | null;
    label?: string | null;
    meta?: string | null;
    count: number;
    amount: number;
}

interface RawSchedule {
    overdueQuotes: number;
    overdueAmount: number;
    next7Quotes: number;
    next7Amount: number;
    next30Quotes: number;
    next30Amount: number;
}

interface RawMetrics {
    totals: RawTotals[];
    byStatus: RawBucket[];
    byType: RawBucket[];
    monthly: RawBucket[];
    schedule: RawSchedule[];
    topProducts: RawEntry[];
    topClients: RawEntry[];
    byAdvisor: RawEntry[];
}

/** El dinero se redondea a dos decimales: los promedios de Mongo traen colas largas. */
function round(value: number | null | undefined): number {
    return Math.round((value ?? 0) * 100) / 100;
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

    /**
     * Métricas de colocación y proyección de cobro en **una sola agregación**
     * (`$facet`): traer los prestamos al cliente para sumarlos no escala.
     */
    async getMetrics(filter: LoanMetricsFilter): Promise<LoanMetrics> {
        const now = new Date();
        const in7Days = new Date(now.getTime() + 7 * DAY_IN_MS);
        const in30Days = new Date(now.getTime() + 30 * DAY_IN_MS);

        const facet: Record<string, PipelineStage.FacetPipelineStage[]> = {
            totals: [
                {
                    $group: {
                        _id: null,
                        loans: { $sum: 1 },
                        placed: { $sum: '$amount' },
                        // `quotes` es un arreglo: la suma interna es la del préstamo.
                        projectedInterest: { $sum: { $sum: '$quotes.interestValue' } },
                        receivable: { $sum: { $sum: '$quotes.totalValue' } },
                        averageTicket: { $avg: '$amount' },
                        averageRate: { $avg: '$interestRate' },
                        averageTerm: { $avg: '$numberQuotes' },
                    },
                },
            ],
            byStatus: [
                { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
            ],
            byType: [
                { $group: { _id: '$loanType', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
            ],
            monthly: [
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m', date: '$startDate' } },
                        count: { $sum: 1 },
                        amount: { $sum: '$amount' },
                    },
                },
                { $sort: { _id: 1 } },
            ],
            schedule: [
                // Sin registro de pagos la ventana solo tiene sentido sobre préstamos vigentes.
                { $match: { status: LoanStatus.ACTIVE } },
                { $unwind: '$quotes' },
                {
                    $group: {
                        _id: null,
                        overdueQuotes: {
                            $sum: { $cond: [{ $lt: ['$quotes.expirationDate', now] }, 1, 0] },
                        },
                        overdueAmount: {
                            $sum: { $cond: [{ $lt: ['$quotes.expirationDate', now] }, '$quotes.totalValue', 0] },
                        },
                        next7Quotes: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $gte: ['$quotes.expirationDate', now] },
                                            { $lte: ['$quotes.expirationDate', in7Days] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                        next7Amount: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $gte: ['$quotes.expirationDate', now] },
                                            { $lte: ['$quotes.expirationDate', in7Days] },
                                        ],
                                    },
                                    '$quotes.totalValue',
                                    0,
                                ],
                            },
                        },
                        next30Quotes: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $gte: ['$quotes.expirationDate', now] },
                                            { $lte: ['$quotes.expirationDate', in30Days] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                        next30Amount: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $gte: ['$quotes.expirationDate', now] },
                                            { $lte: ['$quotes.expirationDate', in30Days] },
                                        ],
                                    },
                                    '$quotes.totalValue',
                                    0,
                                ],
                            },
                        },
                    },
                },
            ],
            topProducts: [
                { $match: { product: { $ne: null } } },
                {
                    $group: {
                        _id: '$product',
                        label: { $first: '$productSnapshot.name' },
                        meta: { $first: '$productSnapshot.code' },
                        count: { $sum: 1 },
                        amount: { $sum: '$amount' },
                    },
                },
                { $sort: { amount: -1 } },
                { $limit: RANKING_SIZE },
            ],
            topClients: [
                {
                    $group: {
                        _id: '$client',
                        label: { $first: '$customerSnapshot.fullName' },
                        meta: { $first: '$customerSnapshot.documentNumber' },
                        count: { $sum: 1 },
                        amount: { $sum: '$amount' },
                    },
                },
                { $sort: { amount: -1 } },
                { $limit: RANKING_SIZE },
            ],
        };

        if (filter.includeAdvisors) {
            facet.byAdvisor = [
                { $match: { approvedBy: { $ne: null } } },
                { $group: { _id: '$approvedBy', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
                { $sort: { amount: -1 } },
                { $limit: RANKING_SIZE },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'advisor',
                    },
                },
                {
                    $project: {
                        count: 1,
                        amount: 1,
                        label: { $first: '$advisor.fullName' },
                        meta: { $first: '$advisor.email' },
                    },
                },
            ];
        }

        const pipeline: PipelineStage[] = [];
        const dateFilter = this.buildDateFilter(filter.from, filter.to);
        if (dateFilter) pipeline.push({ $match: { startDate: dateFilter } });
        pipeline.push({ $facet: facet });

        const [raw] = await this.loanModel.aggregate<RawMetrics>(pipeline).exec();
        return this.toMetrics(raw, filter.includeAdvisors);
    }

    private buildDateFilter(from?: Date, to?: Date): Record<string, Date> | null {
        if (!from && !to) return null;
        return {
            ...(from ? { $gte: from } : {}),
            ...(to ? { $lte: to } : {}),
        };
    }

    private toMetrics(raw: RawMetrics | undefined, includeAdvisors: boolean): LoanMetrics {
        const totals = raw?.totals?.[0];
        const schedule = raw?.schedule?.[0];

        return {
            totals: {
                loans: totals?.loans ?? 0,
                placed: round(totals?.placed),
                projectedInterest: round(totals?.projectedInterest),
                receivable: round(totals?.receivable),
                averageTicket: round(totals?.averageTicket),
                averageRate: round(totals?.averageRate),
                averageTerm: round(totals?.averageTerm),
            },
            byStatus: (raw?.byStatus ?? []).map((bucket) => ({
                key: bucket._id ?? 'UNKNOWN',
                count: bucket.count,
                amount: round(bucket.amount),
            })),
            byType: (raw?.byType ?? []).map((bucket) => ({
                key: bucket._id ?? 'UNKNOWN',
                count: bucket.count,
                amount: round(bucket.amount),
            })),
            monthly: (raw?.monthly ?? []).slice(-MONTHS_IN_SERIES).map((bucket) => ({
                month: bucket._id ?? '',
                count: bucket.count,
                amount: round(bucket.amount),
            })),
            schedule: {
                overdue: {
                    quotes: schedule?.overdueQuotes ?? 0,
                    amount: round(schedule?.overdueAmount),
                },
                next7: { quotes: schedule?.next7Quotes ?? 0, amount: round(schedule?.next7Amount) },
                next30: {
                    quotes: schedule?.next30Quotes ?? 0,
                    amount: round(schedule?.next30Amount),
                },
            },
            topProducts: this.toEntries(raw?.topProducts),
            topClients: this.toEntries(raw?.topClients),
            byAdvisor: includeAdvisors ? this.toEntries(raw?.byAdvisor) : [],
        };
    }

    private toEntries(rows: RawEntry[] | undefined): LoanMetricsEntry[] {
        return (rows ?? []).map((row) => ({
            id: row._id?.toString() ?? '',
            label: row.label ?? '',
            ...(row.meta ? { meta: row.meta } : {}),
            count: row.count,
            amount: round(row.amount),
        }));
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
