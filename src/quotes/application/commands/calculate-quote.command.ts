import { QuoteFrequency } from "src/quotes/domain/enums/quote-frequency.enum";
import { QuoteAmortization } from "src/quotes/domain/enums/quote-amortization.enum";

export class CalculateQuoteCommand {
  constructor(
    public readonly amount: number,
    public readonly frequency: QuoteFrequency,
    public readonly numberQuotes: number,
    public readonly interestRate: number,
    public readonly amortization: QuoteAmortization
  ) {}
}