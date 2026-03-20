import { QuoteExpirationStrategy } from "./quote-expiration-strategy.interface";

export class FortnightlyExpirationStrategy implements QuoteExpirationStrategy {

    async calculate(startDate: Date, quoteIndex: number): Promise<Date> {
        const newDate = new Date(startDate);
        newDate.setDate((newDate.getDate() + quoteIndex * 14) - 1);
        return newDate;
    }

}


