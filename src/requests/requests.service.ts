import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { ApproveRequestDto, CreateRequestDto, ListRequestsQueryDto, RejectRequestDto } from './dto/request.dto';
import {
  CREATABLE_REQUEST_TYPES,
  REQUEST_AUDIENCE,
  RequestStatus,
  RequestType,
} from './enums/request.enums';
import { RequestsGateway } from './requests.gateway';
import { AppRequest, AppRequestDocument, RequestResult } from './schemas/request.schema';

interface PopulatedUser {
  _id: Types.ObjectId;
  fullName?: string;
  email?: string;
}

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(AppRequest.name) private readonly requestModel: Model<AppRequestDocument>,
    private readonly productsService: ProductsService,
    private readonly gateway: RequestsGateway,
  ) {}

  async create(userId: string, dto: CreateRequestDto) {
    if (!CREATABLE_REQUEST_TYPES.includes(dto.type)) {
      throw new BadRequestException('Request type not allowed');
    }

    const created = await this.requestModel.create({
      type: dto.type,
      title: dto.title.trim(),
      description: dto.description?.trim(),
      payload: dto.payload ?? {},
      status: RequestStatus.PENDING,
      audience: REQUEST_AUDIENCE[dto.type] ?? [],
      requestedBy: new Types.ObjectId(userId),
    });

    const dtoResult = await this.findByIdPopulated(String(created._id));
    this.gateway.emitNew(dtoResult);
    return dtoResult;
  }

  async list(query: ListRequestsQueryDto) {
    const page = Math.max(parseInt(query.page ?? '1', 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit ?? '20', 10) || 20, 1), 100);
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;

    const [rows, total] = await Promise.all([
      this.requestModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('requestedBy', 'fullName email')
        .populate('resolvedBy', 'fullName email')
        .lean()
        .exec(),
      this.requestModel.countDocuments(filter).exec(),
    ]);

    return {
      data: rows.map((row) => this.toDto(row)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async pendingCount(): Promise<number> {
    return this.requestModel.countDocuments({ status: RequestStatus.PENDING }).exec();
  }

  async findOne(id: string) {
    const dto = await this.findByIdPopulated(id);
    if (!dto) throw new NotFoundException('Request not found');
    return dto;
  }

  /**
   * Aprueba de forma atómica: solo el primer aprobador "gana" el cambio de estado
   * (findOneAndUpdate condicionado a status=pending). Los demás reciben 409.
   * Si el efecto secundario falla, se revierte el claim a pendiente.
   */
  async approve(id: string, resolverId: string, body: ApproveRequestDto) {
    const now = new Date();
    const claimed = await this.requestModel.findOneAndUpdate(
      { _id: id, status: RequestStatus.PENDING },
      {
        $set: {
          status: RequestStatus.APPROVED,
          resolvedBy: new Types.ObjectId(resolverId),
          resolvedAt: now,
          resolutionNote: body.note?.trim(),
        },
      },
      { new: true },
    );

    if (!claimed) {
      throw await this.buildUnresolvableError(id);
    }

    try {
      const result = await this.applyApproval(claimed, body);
      const createdAt = claimed.get('createdAt') as Date;
      await this.requestModel.updateOne(
        { _id: id },
        { $set: { result, responseTimeMs: now.getTime() - createdAt.getTime() } },
      );
      const dtoResult = await this.findByIdPopulated(id);
      this.emitResolved(dtoResult);
      return dtoResult;
    } catch (error) {
      // Revertir el claim para permitir corregir y reintentar (p. ej. código duplicado).
      await this.requestModel.updateOne(
        { _id: id },
        { $set: { status: RequestStatus.PENDING, resolvedBy: null, resolvedAt: null } },
      );
      throw error;
    }
  }

  async reject(id: string, resolverId: string, body: RejectRequestDto) {
    const now = new Date();
    const claimed = await this.requestModel.findOneAndUpdate(
      { _id: id, status: RequestStatus.PENDING },
      {
        $set: {
          status: RequestStatus.REJECTED,
          resolvedBy: new Types.ObjectId(resolverId),
          resolvedAt: now,
          resolutionNote: body.note?.trim(),
        },
      },
      { new: true },
    );

    if (!claimed) {
      throw await this.buildUnresolvableError(id);
    }

    const createdAt = claimed.get('createdAt') as Date;
    await this.requestModel.updateOne(
      { _id: id },
      { $set: { responseTimeMs: now.getTime() - createdAt.getTime() } },
    );
    const dtoResult = await this.findByIdPopulated(id);
    this.emitResolved(dtoResult);
    return dtoResult;
  }

  /** Emite el evento de resolución a admins y al solicitante. */
  private emitResolved(dto: Awaited<ReturnType<RequestsService['findByIdPopulated']>>) {
    if (!dto) return;
    const requesterId = dto.requestedBy?.id;
    if (requesterId) this.gateway.emitResolved(dto, requesterId);
  }

  /** Ejecuta el efecto de la aprobación según la naturaleza de la solicitud. */
  private async applyApproval(
    request: AppRequestDocument,
    body: ApproveRequestDto,
  ): Promise<RequestResult> {
    switch (request.type) {
      case RequestType.PRODUCT_TYPE_CREATE: {
        const code = body.code?.trim();
        if (!code) {
          throw new BadRequestException('code is required to approve a product type request');
        }
        const payload = request.payload ?? {};
        const created = await this.productsService.createProductType({
          name: (body.name?.trim() || (payload.name as string) || request.title).trim(),
          code,
          notes: body.notes?.trim() ?? (payload.notes as string) ?? request.description,
        });
        return { entity: 'ProductType', entityId: new Types.ObjectId(String(created.id)) };
      }
      default:
        throw new BadRequestException('Unsupported request type');
    }
  }

  /** Construye el error correcto: 404 (no existe) o 409 (ya resuelta por otro). */
  private async buildUnresolvableError(id: string) {
    const exists = await this.requestModel.exists({ _id: id });
    return exists
      ? new ConflictException('Request already resolved by another user')
      : new NotFoundException('Request not found');
  }

  private async findByIdPopulated(id: string) {
    const row = await this.requestModel
      .findById(id)
      .populate('requestedBy', 'fullName email')
      .populate('resolvedBy', 'fullName email')
      .lean()
      .exec();
    return row ? this.toDto(row) : null;
  }

  private toDto(row: Record<string, unknown>) {
    const requestedBy = row.requestedBy as PopulatedUser | null;
    const resolvedBy = row.resolvedBy as PopulatedUser | null;
    return {
      id: String(row._id),
      type: row.type as string,
      title: row.title as string,
      description: (row.description as string) ?? null,
      payload: (row.payload as Record<string, unknown>) ?? {},
      status: row.status as string,
      audience: (row.audience as string[]) ?? [],
      requestedBy: requestedBy
        ? { id: String(requestedBy._id), fullName: requestedBy.fullName, email: requestedBy.email }
        : null,
      resolvedBy: resolvedBy
        ? { id: String(resolvedBy._id), fullName: resolvedBy.fullName, email: resolvedBy.email }
        : null,
      resolvedAt: (row.resolvedAt as Date) ?? null,
      resolutionNote: (row.resolutionNote as string) ?? null,
      responseTimeMs: (row.responseTimeMs as number) ?? null,
      result: (row.result as RequestResult) ?? null,
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date,
    };
  }
}
