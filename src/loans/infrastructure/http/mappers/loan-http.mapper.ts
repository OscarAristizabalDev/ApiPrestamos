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
            dto.customerId,
            dto.customerSnapshot,
            approvedBy,
            dto.amount,
            dto.loanType,
            dto.startDate,
            dto.frequency,
            dto.numberQuotes,
            dto.interestRate,
            dto.amortization,
            dto.quotes.map((quote) => ({
                number: quote.number,
                value: quote.value,
                interestValue: quote.interestValue,
                totalValue: quote.totalValue,
                expirationDate: new Date(quote.expirationDate),
            })),
            dto.productId ?? null,
            dto.productSnapshot ?? null,
        );
    }

    static toListCommand(dto: ListLoanRequestDto): ListLoansCommand {
        return new ListLoansCommand(dto.page, dto.limit, dto.search);
    }

    static toResponse(loan: Loan): LoanResponseDto {
        return {
            id: loan.id,
            amount: loan.amount,
            currency: loan.currency,
            interestRate: loan.interestRate,
            loanType: loan.loanType,
            startDate: loan.startDate.toISOString(),
            frequency: loan.frequency,
            numberQuotes: loan.numberQuotes,
            amortization: loan.amortization,
            quotes: loan.quotes.map((quote) => ({
                number: quote.number,
                value: quote.value,
                interestValue: quote.interestValue,
                totalValue: quote.totalValue,
                expirationDate: quote.expirationDate.toISOString(),
            })),
            status: loan.status,
            client: loan.client,
            customerSnapshot: loan.customerSnapshot,
            productId: loan.productId,
            productSnapshot: loan.productSnapshot,
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
