import { amortization } from "../../entities/amortization.entity";
import { QuoteAmortizationStrategy } from "./quote-amortization-strategy.interface";

export class AmericanQuoteAmortization implements QuoteAmortizationStrategy {

    async calculate(amount: number, numberQuotes: number, interestRate: number, quoteIndex: number): Promise<amortization> {
        
        const value = quoteIndex < numberQuotes ? 0 : amount 
        const interestValue = (amount * (interestRate / 100));
        const totalValue = value + interestValue
        
        return await {
            value,
            interestValue,
            totalValue
        }
    }
}