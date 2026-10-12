import { Quote } from 'src/quotes/domain/entities/quote.entity';
import { Loan } from '../entities/loan.entity';

// Terms a client-calculated schedule must be consistent with.
export type ScheduleTerms = Pick<Loan, 'amount' | 'startDate' | 'numberQuotes'>;

// Allowed rounding drift per quote, so clients may round each quote to cents.
export const MONEY_TOLERANCE_PER_QUOTE = 0.01;

/**
 * Structural check of a schedule received from the client. Interest values are
 * not recomputed here: that would mean re-running the amortization strategies.
 */
export function quotesMatchTerms(terms: ScheduleTerms, quotes: Quote[]): boolean {
    if (quotes.length !== terms.numberQuotes) return false;

    const tolerance = MONEY_TOLERANCE_PER_QUOTE * quotes.length;
    const principal = quotes.reduce((sum, quote) => sum + quote.value, 0);
    if (Math.abs(principal - terms.amount) > tolerance) return false;

    let previousDue = terms.startDate.getTime();

    return quotes.every((quote, index) => {
        const due = quote.expirationDate.getTime();
        const isConsistent =
            quote.number === index + 1 &&
            due > previousDue &&
            Math.abs(quote.value + quote.interestValue - quote.totalValue) <= MONEY_TOLERANCE_PER_QUOTE;

        previousDue = due;
        return isConsistent;
    });
}
