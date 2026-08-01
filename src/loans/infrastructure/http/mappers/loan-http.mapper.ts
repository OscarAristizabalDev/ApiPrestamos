import { Loan } from 'src/loans/domain/entities/loan.entity';
import { PaginatedLoans } from 'src/loans/application/ports/outgoing/loan-repository.port';
import { CreateLoanCommand } from 'src/loans/application/commands/create-loan.command';
import { ListLoansCommand } from 'src/loans/application/commands/list-loans.command';
import { CreateLoanRequestDto } from '../dto/create-loan.request.dto';
import { ListLoanRequestDto } from '../dto/list-loan.request.dto';
import { LoanResponseDto, PaginatedLoanResponseDto } from '../dto/loan-response.dto';

export class LoanHttpMapper {

    static toCreateCommand(dto: CreateLoanRequestDto, approvedBy: string): CreateLoanCommand {
        return new CreateLoanCommand(
            dto.clientId,
            approvedBy,
            dto.amount,
            dto.currency,
            dto.interestRate,
            dto.interestRateType,
            dto.term,
            dto.paymentFrequency,
            dto.amortizationMethod,
            dto.startDate,
            dto.loanType,
            dto.warranty,
        );
    }

    static toListCommand(dto: ListLoanRequestDto): ListLoansCommand {
        return new ListLoansCommand(dto.page, dto.limit);
    }

    static toResponse(loan: Loan): LoanResponseDto {
        return {
            id: loan.id,
            amount: loan.amount,
            currency: loan.currency,
            interestRate: loan.interestRate,
            interestRateType: loan.interestRateType,
            term: loan.term,
            paymentFrequency: loan.paymentFrequency,
            amortizationMethod: loan.amortizationMethod,
            startDate: loan.startDate.toISOString(),
            loanType: loan.loanType,
            status: loan.status,
            warranty: loan.warranty,
            client: loan.client,
            approvedBy: loan.approvedBy,
        };
    }

    static toPaginatedResponse(paginated: PaginatedLoans): PaginatedLoanResponseDto {
        return {
            data: paginated.data.map((loan) => this.toResponse(loan)),
            total: paginated.total,
            page: paginated.page,
            limit: paginated.limit,
            totalPages: paginated.totalPages,
        };
    }
}
