import { Loan } from 'src/loans/domain/entities/loan.entity';
import { UpdateLoanCommand } from '../../commands/update-loan.command';

export interface UpdateLoanUseCase {

    update(command: UpdateLoanCommand): Promise<Loan>
}
