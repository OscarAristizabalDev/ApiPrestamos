import { QuoteExpirationDateStrategy } from "./quote-strategy.interface";

export class MonthlyQuoteStrategy implements QuoteExpirationDateStrategy {

    calculate(startDate: Date, quoteIndex: number): Date {
        const newDate = new Date(startDate);
        newDate.setMonth((newDate.getMonth() + quoteIndex));
        return newDate;
    }
    
}
