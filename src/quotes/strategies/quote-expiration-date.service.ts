import { Inject, Injectable } from '@nestjs/common';
import { QuoteExpirationDateStrategy } from './quote-strategy.interface';

@Injectable()
export class QuoteExpirationDateService {

  constructor(@Inject('QuoteExpirationDateStrategy') private strategy: QuoteExpirationDateStrategy) {}

  setStrategy(strategy: QuoteExpirationDateStrategy) {
    this.strategy = strategy;
  }

  async calculate(startDate: Date, QuoteIndex: number): Promise<Date> {
    return await this.strategy.calculate(startDate, QuoteIndex);
  }
}

