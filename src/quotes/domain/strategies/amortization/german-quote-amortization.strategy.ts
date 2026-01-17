import { amortization } from "../../entities/amortization.entity";
import { QuoteAmortizationStrategy } from "./quote-amortization-strategy.interface";

export class GermanQuoteAmortization implements QuoteAmortizationStrategy {

    async calculate(amount: number, numberQuotes: number, interestRate: number, quoteIndex: number): Promise<amortization> {
        
        const value = amount / 5
        const numberPaymentsMade = quoteIndex - 1
        const interestValue = quoteIndex <= 1 ? (amount * (interestRate / 100)) : ((amount - (value * numberPaymentsMade)) * (interestRate / 100))
        const totalValue = value + interestValue
        
        return await {
            value,
            interestValue,
            totalValue
        }
    }
}