import { Module } from '@nestjs/common';
import { QuoteService } from './application/services/quote.service';
import { QuoteController } from './infrastructure/http/controllers/quote.controller'; 
import { DailyExpirationStrategy } from './domain/strategies/expiration/daily-quote.strategy';
import { WeeklyExpirationStrategy } from './domain/strategies/expiration/weekly-quotestrategy';
import { MonthlyExpirationStrategy, } from './domain/strategies/expiration/monthly-quote.strategy';
import { QuoteExpirationService } from './application/services/expiration/quote-expiration.service';
import { FortnightlyExpirationStrategy } from './domain/strategies/expiration/fortnightly-quote.strategy';
import { QuoteExpirationStrategyResolver } from './application/services/expiration/quote-expiration-strategy.resolver';
import { QuoteAmortizationStrategyResolver } from './application/services/amortization/quote-amortization-strategy.resolver';
import { FrenchQuoteAmortization } from './domain/strategies/amortization/french-quote-amortization.strategy';
import { GermanQuoteAmortization } from './domain/strategies/amortization/german-quote-amortization.strategy';
import { AmericanQuoteAmortization } from './domain/strategies/amortization/american-quote-amortization.strategy';
import { QuoteAmortizationService } from './application/services/amortization/quote-amortization.service';

@Module({
  controllers: [QuoteController],
  providers: [
    // Application services
    QuoteService,
    QuoteExpirationService,
    QuoteExpirationStrategyResolver,
    QuoteAmortizationService,
    QuoteAmortizationStrategyResolver,

    // Domain strategies (DI-managed)
    DailyExpirationStrategy,
    WeeklyExpirationStrategy,
    FortnightlyExpirationStrategy,
    MonthlyExpirationStrategy,
    FrenchQuoteAmortization,
    GermanQuoteAmortization,
    AmericanQuoteAmortization
  ],
  exports: [QuoteService],
})
export class QuotesModule {}
