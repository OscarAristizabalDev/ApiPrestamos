import { Injectable, Scope } from '@nestjs/common';
import { Quote } from 'src/quotes/domain/entities/quote.entity';
import { CalculateQuoteCommand } from '../commands/calculate-quote.command';
import { QuoteExpirationService } from './expiration/quote-expiration.service';
import { QuoteExpirationStrategyResolver } from './expiration/quote-expiration-strategy.resolver';
import { QuoteAmortizationStrategyResolver } from './amortization/quote-amortization-strategy.resolver';
import { QuoteAmortizationService } from './amortization/quote-amortization.service';

@Injectable({ scope: Scope.REQUEST })
export class QuoteService {

    constructor(
        private readonly expirationService: QuoteExpirationService,
        private readonly expirationResolver: QuoteExpirationStrategyResolver,
        private readonly amortizationService: QuoteAmortizationService,
        private readonly amortizationResolver: QuoteAmortizationStrategyResolver
    ) {}

    async calculate(dto: CalculateQuoteCommand): Promise<Quote[]> {
        const { amount, frequency, numberQuotes, interestRate, amortization } = dto;

        const expirationStrategy = this.expirationResolver.resolve(frequency);
        const amortizationStrategy = this.amortizationResolver.resolve(amortization);

        const quotes: Quote[] = [];
        const startDate = new Date();

        for (let i = 1; i <= numberQuotes; i++) {

            const quote = new Quote();
            quote.number = i;

            quote.expirationDate = await this.expirationService.calculate(expirationStrategy, startDate, i);

            // quote.value = amount / numberQuotes;
            // quote.interestValue = (amount * (interestRate / 100)) / numberQuotes;
            // quote.totalValue = quote.value + quote.interestValue;

            const amortization = await this.amortizationService.calculate(amortizationStrategy, amount, numberQuotes, interestRate, i)
            const { value, interestValue, totalValue } = amortization;

            quote.value = value
            quote.interestValue = interestValue
            quote.totalValue = totalValue

            quotes.push(quote);
        }

    return quotes;
    }
}
