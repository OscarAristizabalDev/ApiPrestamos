import { QuoteExpirationDateStrategy } from "./quote-strategy.interface";

export class FortnightlyQuoteStrategy implements QuoteExpirationDateStrategy {

    calculate(startDate: Date, quoteIndex: number): Date {
        const newDate = new Date(startDate);
        newDate.setDate((newDate.getDate() + quoteIndex * 14) - 1);
        return newDate;
    }

}


