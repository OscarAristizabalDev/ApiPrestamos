import { QuoteExpirationStrategy } from "./quote-expiration-strategy.interface";

export class DailyExpirationStrategy implements QuoteExpirationStrategy {
    
    async calculate(startDate: Date, quoteIndex: number): Promise<Date> {
        const newDate = new Date(startDate);
        newDate.setDate((newDate.getDate() + quoteIndex) - 1);
        return newDate;
    }
    
}