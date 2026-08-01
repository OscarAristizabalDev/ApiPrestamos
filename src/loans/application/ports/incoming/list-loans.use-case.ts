import { PaginatedLoans } from '../outgoing/loan-repository.port';
import { ListLoansCommand } from '../../commands/list-loans.command';

export interface ListLoansUseCase {

    list(command: ListLoansCommand): Promise<PaginatedLoans>
}
