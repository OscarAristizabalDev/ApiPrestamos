import { LoanAmortizationMethod } from '../../domain/enums/loan-amortization-method.enum';
import { LoanInterestRateType } from '../../domain/enums/loan-interest-rate-type.enum';
import { LoanPaymentFrequency } from '../../domain/enums/loan-payment-frequency.enum';

export class CreateLoanCommand {
  constructor(
    public readonly clientId: string,
    public readonly approvedBy: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly interestRate: number,
    public readonly interestRateType: LoanInterestRateType,
    public readonly term: number,
    public readonly paymentFrequency: LoanPaymentFrequency,
    public readonly amortizationMethod: LoanAmortizationMethod,
    public readonly startDate: string,
    public readonly loanType: string,
    public readonly warranty?: string,
  ) {}
}
