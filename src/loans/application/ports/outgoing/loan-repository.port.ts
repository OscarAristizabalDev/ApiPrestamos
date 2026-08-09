import { Loan } from 'src/loans/domain/entities/loan.entity';
import { CreateLoanCommand } from '../../commands/create-loan.command';

export interface PaginatedLoans {
    data: Loan[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface LoanRepositoryPort {
    create(command: CreateLoanCommand): Promise<Loan>;
    findPaginated(page: number, limit: number): Promise<PaginatedLoans>;
    clientExists(clientId: string): Promise<boolean>;
    productExists(productId: string): Promise<boolean>;
}
