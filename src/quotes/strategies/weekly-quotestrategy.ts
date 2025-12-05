import { QuoteExpirationDateStrategy } from "./quote-strategy.interface";

export class WeeklyQuoteStrategy implements QuoteExpirationDateStrategy{

    calculate(startDate: Date, QuoteIndex: number): Date {
        const newDate = new Date(startDate);
        newDate.setDate((newDate.getDate() + QuoteIndex * 7) - 1);
        return newDate;
    }
}