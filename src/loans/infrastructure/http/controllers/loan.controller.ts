import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ROLEACCESS } from 'src/clients/interfaces/client-repository.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';
import { CurrentUserDto } from 'src/auth/dto/current-user.dto';
import {
    CREATE_LOAN_USE_CASE,
    GET_LOAN_METRICS_USE_CASE,
    LIST_LOANS_USE_CASE,
    UPDATE_LOAN_USE_CASE,
} from 'src/loans/application/ports/incoming/tokens';
import { CreateLoanUseCase } from 'src/loans/application/ports/incoming/create-loan.use-case';
import { ListLoansUseCase } from 'src/loans/application/ports/incoming/list-loans.use-case';
import { GetLoanMetricsUseCase } from 'src/loans/application/ports/incoming/get-loan-metrics.use-case';
import { UpdateLoanUseCase } from 'src/loans/application/ports/incoming/update-loan.use-case';
import { LoanNotEditableError } from 'src/loans/domain/errors/loan-not-editable.error';
import { LoanHttpMapper } from '../mappers/loan-http.mapper';
import { CreateLoanRequestDto } from '../dto/create-loan.request.dto';
import { UpdateLoanRequestDto } from '../dto/update-loan.request.dto';
import { LoanResponseDto, PaginatedLoanResponseDto } from '../dto/loan-response.dto';
import { LoanMetricsResponseDto } from '../dto/loan-metrics.response.dto';
import { ListLoanRequestDto } from '../dto/list-loan.request.dto';
import { LoanMetricsRequestDto } from '../dto/loan-metrics.request.dto';

@ApiTags('Loans/Prestamos')
@ApiBearerAuth()
@Controller('loans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoanController {

    constructor(
        @Inject(CREATE_LOAN_USE_CASE)
        private readonly createLoanUseCase: CreateLoanUseCase,
        @Inject(LIST_LOANS_USE_CASE)
        private readonly listLoansUseCase: ListLoansUseCase,
        @Inject(GET_LOAN_METRICS_USE_CASE)
        private readonly getLoanMetricsUseCase: GetLoanMetricsUseCase,
        @Inject(UPDATE_LOAN_USE_CASE)
        private readonly updateLoanUseCase: UpdateLoanUseCase,
    ) {}

    @Get()
    @ApiOkResponse({ type: PaginatedLoanResponseDto })
    async getLoans(@Query() query: ListLoanRequestDto) {
        const command = LoanHttpMapper.toListCommand(query);
        const loans = await this.listLoansUseCase.list(command);
        return LoanHttpMapper.toPaginatedResponse(loans);
    }

    /** Métricas agregadas de la cartera. Solo staff: el rol `user` no las ve. */
    @Get('metrics')
    @ApiOkResponse({ type: LoanMetricsResponseDto })
    @Roles(ROLEACCESS.MIDACCESS)
    async getMetrics(@Query() query: LoanMetricsRequestDto, @AuthUser() user: CurrentUserDto) {
        const command = LoanHttpMapper.toMetricsCommand(query, user.role);
        const metrics = await this.getLoanMetricsUseCase.get(command);
        return LoanHttpMapper.toMetricsResponse(metrics);
    }

    @Post()
    @ApiCreatedResponse({ type: LoanResponseDto })
    async createLoan(@Body() bodyLoan: CreateLoanRequestDto, @AuthUser() user: CurrentUserDto) {
        if (!bodyLoan || Object.keys(bodyLoan).length === 0) {
            throw new BadRequestException('El cuerpo de la petición no puede estar vacío');
        }

        const command = LoanHttpMapper.toCreateCommand(bodyLoan, user.id);
        const loan = await this.createLoanUseCase.create(command);
        return LoanHttpMapper.toResponse(loan);
    }

    /** Ownership is checked in the use case: the advisor who registered the loan or a superadmin. */
    @Patch(':id')
    @ApiOkResponse({ type: LoanResponseDto })
    async updateLoan(
        @Param('id') loanId: string,
        @Body() bodyLoan: UpdateLoanRequestDto,
        @AuthUser() user: CurrentUserDto,
    ) {
        if (!bodyLoan || Object.keys(bodyLoan).length === 0) {
            throw new BadRequestException('El cuerpo de la petición no puede estar vacío');
        }

        const command = LoanHttpMapper.toUpdateCommand(loanId, bodyLoan, user.id, user.role);

        try {
            const loan = await this.updateLoanUseCase.update(command);
            return LoanHttpMapper.toResponse(loan);
        } catch (error) {
            // Domain errors carry no HTTP semantics; translate them here.
            if (error instanceof LoanNotEditableError) {
                throw new ConflictException('El préstamo ya no está activo y no se puede editar');
            }
            throw error;
        }
    }
}
