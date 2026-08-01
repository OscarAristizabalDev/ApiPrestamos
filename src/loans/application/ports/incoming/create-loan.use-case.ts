import { Loan } from 'src/loans/domain/entities/loan.entity';
import { CreateLoanCommand } from '../../commands/create-loan.command';

export interface CreateLoanUseCase {

    create(command: CreateLoanCommand): Promise<Loan>
}
