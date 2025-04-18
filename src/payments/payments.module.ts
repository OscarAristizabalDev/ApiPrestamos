import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
// import { PaymentStrategyService } from './strategies/payment-expiration-date.service';
import { MonthlyPaymentStrategy } from './strategies/monthly-payment.strategy';
import { PaymentExpirationDateService } from './strategies/payment-expiration-date.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService, 
    PaymentExpirationDateService,
    { provide: 'PaymentExpirationDateStrategy', useClass: MonthlyPaymentStrategy }, // Example provider
  ],
  exports: [PaymentsService, PaymentExpirationDateService],
})
export class PaymentsModule {}
