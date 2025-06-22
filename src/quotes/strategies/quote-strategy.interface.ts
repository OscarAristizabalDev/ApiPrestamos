export interface QuoteExpirationDateStrategy {    
    calculate(startDate: Date, quoteIndex: number): Date;
}
    