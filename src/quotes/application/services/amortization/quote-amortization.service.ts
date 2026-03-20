import { Injectable } from "@nestjs/common";
import { amortization } from "src/quotes/domain/entities/amortization.entity";
import { QuoteAmortizationStrategy } from "src/quotes/domain/strategies/amortization/quote-amortization-strategy.interface";

@Injectable()
export class QuoteAmortizationService {

  async calculate(
    strategy: QuoteAmortizationStrategy,
    amount: number, 
    numberQuotes: number, 
    interestRate: number,
    quoteIndex: number
  ): Promise<amortization> {
    return await strategy.calculate(amount, numberQuotes, interestRate, quoteIndex);
  }

}