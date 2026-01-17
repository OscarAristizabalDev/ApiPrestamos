import { amortization } from "../../entities/amortization.entity";

export interface QuoteAmortizationStrategy {
    calculate(amount: number, numberQuotes: number, interestRate: number, quoteIndex: number): Promise<amortization>;
}