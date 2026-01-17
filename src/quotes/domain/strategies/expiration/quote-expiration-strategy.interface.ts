export interface QuoteExpirationStrategy {    
    calculate(startDate: Date, quoteIndex: number): Promise<Date>;
}