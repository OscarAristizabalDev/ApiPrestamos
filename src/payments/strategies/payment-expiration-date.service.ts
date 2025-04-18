import { Inject, Injectable } from '@nestjs/common';
import { PaymentExpirationDateStrategy } from './payment-strategy.interface';

@Injectable()
export class PaymentExpirationDateService {

  constructor(@Inject('PaymentExpirationDateStrategy') private strategy: PaymentExpirationDateStrategy) {}

  setStrategy(strategy: PaymentExpirationDateStrategy) {
    this.strategy = strategy;
  }

  async calculate(startDate: Date, paymentIndex: number): Promise<Date> {
    return await this.strategy.calculate(startDate, paymentIndex);
  }
}

