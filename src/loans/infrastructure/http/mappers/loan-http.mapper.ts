import { Loan } from 'src/loans/domain/entities/loan.entity';
import { PaginatedLoans } from 'src/loans/application/ports/outgoing/loan-repository.port';
import { CreateLoanCommand } from 'src/loans/application/commands/create-loan.command';
import { UpdateLoanCommand } from 'src/loans/application/commands/update-loan.command';
import { ListLoansCommand } from 'src/loans/application/commands/list-loans.command';
import { GetLoanMetricsCommand } from 'src/loans/application/commands/get-loan-metrics.command';
import { LoanMetrics } from 'src/loans/application/ports/outgoing/loan-repository.port';
import { CreateLoanRequestDto } from '../dto/create-loan.request.dto';
import { UpdateLoanRequestDto } from '../dto/update-loan.request.dto';
import { ListLoanRequestDto } from '../dto/list-loan.request.dto';
import { LoanMetricsRequestDto } from '../dto/loan-metrics.request.dto';
import { LoanMetricsResponseDto } from '../dto/loan-metrics.response.dto';
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

    static toUpdateCommand(
        loanId: string,
        dto: UpdateLoanRequestDto,
        actorId: string,
        actorRole: string,
    ): UpdateLoanCommand {
        return new UpdateLoanCommand(
            loanId,
            actorId,
            actorRole,
            {
                amount: dto.amount,
                currency: dto.currency,
                interestRate: dto.interestRate,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                frequency: dto.frequency,
                numberQuotes: dto.numberQuotes,
                amortization: dto.amortization,
            },
            dto.quotes?.map((quote) => ({
                number: quote.number,
                value: quote.value,
                interestValue: quote.interestValue,
                totalValue: quote.totalValue,
                expirationDate: new Date(quote.expirationDate),
            })) ?? null,
        );
    }

    static toListCommand(dto: ListLoanRequestDto): ListLoansCommand {
        return new ListLoansCommand(dto.page, dto.limit, dto.search);
    }

    static toMetricsCommand(dto: LoanMetricsRequestDto, role?: string): GetLoanMetricsCommand {
        return new GetLoanMetricsCommand(
            dto.from ? new Date(dto.from) : undefined,
            dto.to ? new Date(dto.to) : undefined,
            role,
        );
    }

    static toMetricsResponse(metrics: LoanMetrics): LoanMetricsResponseDto {
        return metrics;
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
