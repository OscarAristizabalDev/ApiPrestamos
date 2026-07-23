import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RequestStatus, RequestType } from '../enums/request.enums';

export class CreateRequestDto {
  @IsEnum(RequestType)
  type: RequestType;

  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  /** Datos específicos de la naturaleza (validados por el handler correspondiente). */
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

export class ListRequestsQueryDto {
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @IsEnum(RequestType)
  type?: RequestType;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}

/**
 * Cuerpo de aprobación. Los campos dependen de la naturaleza; para
 * PRODUCT_TYPE_CREATE el aprobador aporta el `code` (único) y puede ajustar
 * nombre/notas antes de crear el tipo.
 */
export class ApproveRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  /** Observación/razón de la aprobación (trazabilidad, visible para el solicitante). */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class RejectRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
