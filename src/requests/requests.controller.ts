import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ROLEACCESS } from '../clients/interfaces/client-repository.interface';
import {
  ApproveRequestDto,
  CreateRequestDto,
  ListRequestsQueryDto,
  RejectRequestDto,
} from './dto/request.dto';
import { RequestsService } from './requests.service';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  /** Crear solicitud: cualquier usuario autenticado (p. ej. rol `user`). */
  @Post()
  async create(@AuthUser('id') userId: string, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(userId, dto);
  }

  @Get()
  @Roles(ROLEACCESS.MIDACCESS)
  async list(@Query() query: ListRequestsQueryDto) {
    return this.requestsService.list(query);
  }

  @Get('pending/count')
  @Roles(ROLEACCESS.MIDACCESS)
  async pendingCount() {
    return { count: await this.requestsService.pendingCount() };
  }

  @Get(':id')
  @Roles(ROLEACCESS.MIDACCESS)
  async findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Post(':id/approve')
  @Roles(ROLEACCESS.MIDACCESS)
  async approve(
    @AuthUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: ApproveRequestDto,
  ) {
    return this.requestsService.approve(id, userId, body);
  }

  @Post(':id/reject')
  @Roles(ROLEACCESS.MIDACCESS)
  async reject(
    @AuthUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: RejectRequestDto,
  ) {
    return this.requestsService.reject(id, userId, body);
  }
}
