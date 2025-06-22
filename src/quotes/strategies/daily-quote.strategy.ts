import { QuoteExpirationDateStrategy } from "./quote-strategy.interface";

export class DailyQuoteStrategy implements QuoteExpirationDateStrategy {
    
    calculate(startDate: Date, quoteIndex: number): Date {
        const newDate = new Date(startDate);
        newDate.setDate((newDate.getDate() + quoteIndex) - 1);
        return newDate;
    }
    
}