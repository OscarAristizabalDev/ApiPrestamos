import { Injectable, Scope } from "@nestjs/common";
import { QuoteExpirationStrategy } from "src/quotes/domain/strategies/expiration/quote-expiration-strategy.interface";


@Injectable()
export class QuoteExpirationService {

  async calculate(
    strategy: QuoteExpirationStrategy,
    startDate: Date,
    quoteIndex: number
  ): Promise<Date> {
    return await strategy.calculate(startDate, quoteIndex);
  }

}