import { BadRequestException, Body, Controller, Get, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';
import { CurrentUserDto } from 'src/auth/dto/current-user.dto';
import { CREATE_LOAN_USE_CASE, LIST_LOANS_USE_CASE } from 'src/loans/application/ports/incoming/tokens';
import { CreateLoanUseCase } from 'src/loans/application/ports/incoming/create-loan.use-case';
import { ListLoansUseCase } from 'src/loans/application/ports/incoming/list-loans.use-case';
import { LoanHttpMapper } from '../mappers/loan-http.mapper';
import { CreateLoanRequestDto } from '../dto/create-loan.request.dto';
import { ListLoanRequestDto } from '../dto/list-loan.request.dto';

@ApiTags('Loans/Prestamos')
@Controller('loans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoanController {

    constructor(
        @Inject(CREATE_LOAN_USE_CASE)
        private readonly createLoanUseCase: CreateLoanUseCase,
        @Inject(LIST_LOANS_USE_CASE)
        private readonly listLoansUseCase: ListLoansUseCase,
    ) {}

    @Get()
    async getLoans(@Query() query: ListLoanRequestDto) {
        const command = LoanHttpMapper.toListCommand(query);
        const loans = await this.listLoansUseCase.list(command);
        return LoanHttpMapper.toPaginatedResponse(loans);
    }

    @Post()
    async createLoan(@Body() bodyLoan: CreateLoanRequestDto, @AuthUser() user: CurrentUserDto) {
        if (!bodyLoan || Object.keys(bodyLoan).length === 0) {
            throw new BadRequestException('El cuerpo de la petición no puede estar vacío');
        }

        const command = LoanHttpMapper.toCreateCommand(bodyLoan, user.id);
        const loan = await this.createLoanUseCase.create(command);
        return LoanHttpMapper.toResponse(loan);
    }
}
