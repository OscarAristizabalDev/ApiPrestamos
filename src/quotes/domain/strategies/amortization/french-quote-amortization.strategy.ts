import { amortization } from "../../entities/amortization.entity";
import { QuoteAmortizationStrategy } from "./quote-amortization-strategy.interface";

export class FrenchQuoteAmortization implements QuoteAmortizationStrategy {

    async calculate(amount: number, numberQuotes: number, interestRate: number, quoteIndex: number): Promise<amortization> {
        
        const value = amount / 5
        const interestValue = (amount * (interestRate / 100));
        const totalValue = value + interestValue

        return await {
            value,
            totalValue,
            interestValue
        }
    }
}