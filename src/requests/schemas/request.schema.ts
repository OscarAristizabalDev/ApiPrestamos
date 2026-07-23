import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RequestStatus, RequestType } from '../enums/request.enums';

export type AppRequestDocument = AppRequest & Document;

/** Trazabilidad de la entidad creada al aprobar (p. ej. el tipo de producto). */
export interface RequestResult {
  entity: string;
  entityId: Types.ObjectId;
}

@Schema({ timestamps: true, collection: 'requests' })
export class AppRequest {
  /** Naturaleza de la solicitud (RequestType). */
  @Prop({ required: true, enum: Object.values(RequestType), index: true })
  type: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  /** Datos específicos de la naturaleza (flexible). */
  @Prop({ type: Object, default: {} })
  payload: Record<string, unknown>;

  @Prop({
    required: true,
    enum: Object.values(RequestStatus),
    default: RequestStatus.PENDING,
    index: true,
  })
  status: string;

  /** Roles que pueden ver/resolver la solicitud. */
  @Prop({ type: [String], default: [] })
  audience: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  requestedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  resolvedBy?: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  resolvedAt?: Date | null;

  @Prop({ trim: true })
  resolutionNote?: string;

  /** Tiempo de respuesta (ms) entre creación y resolución. */
  @Prop({ type: Number, default: null })
  responseTimeMs?: number | null;

  @Prop({ type: Object, default: null })
  result?: RequestResult | null;
}

export const RequestSchema = SchemaFactory.createForClass(AppRequest);
RequestSchema.index({ status: 1, createdAt: -1 });
