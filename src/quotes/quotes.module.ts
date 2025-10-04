import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
// import { PaymentStrategyService } from './strategies/payment-expiration-date.service';
import { MonthlyQuoteStrategy } from './strategies/monthly-quote.strategy';
import { QuoteExpirationDateService } from './strategies/quote-expiration-date.service';

@Module({
  controllers: [QuoteController],
  providers: [
    QuoteService, 
    QuoteExpirationDateService,
    { provide: 'QuoteExpirationDateStrategy', useClass: MonthlyQuoteStrategy }, // Example provider
  ],
  exports: [QuoteService, QuoteExpirationDateService],
})
export class QuotesModule {}
