import { QuoteExpirationStrategy } from "./quote-expiration-strategy.interface";

export class WeeklyExpirationStrategy implements QuoteExpirationStrategy{

    async calculate(startDate: Date, QuoteIndex: number): Promise<Date> {
        const newDate = new Date(startDate);
        newDate.setDate((newDate.getDate() + QuoteIndex * 7) - 1);
        return newDate;
    }
}