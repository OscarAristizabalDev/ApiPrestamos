import { QuoteExpirationStrategy } from "./quote-expiration-strategy.interface";

export class MonthlyExpirationStrategy implements QuoteExpirationStrategy {

    async calculate(startDate: Date, quoteIndex: number): Promise<Date> {
        const newDate = new Date(startDate);
        newDate.setMonth((newDate.getMonth() + quoteIndex));
        return newDate;
    }
    
}
