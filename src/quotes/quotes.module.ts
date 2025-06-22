import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
// import { PaymentStrategyService } from './strategies/payment-expiration-date.service';
import { MonthlyQuoteStrategy } from './strategies/monthly-quote.strategy';
import { QuoteExpirationDateService } from './strategies/quote-expiration-date.service';

@Module({
  controllers: [QuotesController],
  providers: [
    QuotesService, 
    QuoteExpirationDateService,
    { provide: 'QuoteExpirationDateStrategy', useClass: MonthlyQuoteStrategy }, // Example provider
  ],
  exports: [QuotesService, QuoteExpirationDateService],
})
export class QuotesModule {}
