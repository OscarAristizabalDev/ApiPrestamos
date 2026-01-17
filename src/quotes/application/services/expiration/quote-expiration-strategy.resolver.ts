import { Injectable } from "@nestjs/common";
import { QuoteFrequency } from "src/quotes/domain/enums/quote-frequency.enum";
import { DailyExpirationStrategy } from "src/quotes/domain/strategies/expiration/daily-quote.strategy";
import { FortnightlyExpirationStrategy } from "src/quotes/domain/strategies/expiration/fortnightly-quote.strategy";
import { MonthlyExpirationStrategy } from "src/quotes/domain/strategies/expiration/monthly-quote.strategy";
import { QuoteExpirationStrategy } from "src/quotes/domain/strategies/expiration/quote-expiration-strategy.interface";
import { WeeklyExpirationStrategy } from "src/quotes/domain/strategies/expiration/weekly-quotestrategy";


@Injectable()
export class QuoteExpirationStrategyResolver {

  constructor(
    private readonly daily: DailyExpirationStrategy,
    private readonly weekly: WeeklyExpirationStrategy,
    private readonly fortnight: FortnightlyExpirationStrategy,
    private readonly monthly: MonthlyExpirationStrategy,
  ) {}

  resolve(frequency: QuoteFrequency): QuoteExpirationStrategy {
    switch (frequency) {
      case QuoteFrequency.DAILY:
        return this.daily;
      case QuoteFrequency.WEEKLY:
        return this.weekly;
      case QuoteFrequency.FORTNIGHTLY:
        return this.fortnight
      case QuoteFrequency.MONTHLY:
        return this.monthly;
      default:
        throw new Error('Unsupported quote frequency');
    }
  }
}