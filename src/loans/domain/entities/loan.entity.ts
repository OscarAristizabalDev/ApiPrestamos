import { LoanAmortizationMethod } from '../enums/loan-amortization-method.enum';
import { LoanInterestRateType } from '../enums/loan-interest-rate-type.enum';
import { LoanPaymentFrequency } from '../enums/loan-payment-frequency.enum';
import { LoanStatus } from '../enums/loan-status.enum';

export class LoanParty {
    id: string;
    fullName: string;
    email?: string;
    documentNumber?: string;
}

export class Loan {
    id: string;
    amount: number;
    currency: string;
    interestRate: number;
    interestRateType: LoanInterestRateType;
    term: number;
    paymentFrequency: LoanPaymentFrequency;
    amortizationMethod: LoanAmortizationMethod;
    startDate: Date;
    loanType: string;
    status: LoanStatus;
    warranty?: string;
    client: LoanParty | null;
    approvedBy: LoanParty | null;
    createdAt?: Date;
}
