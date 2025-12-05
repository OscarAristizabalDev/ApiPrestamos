import { Injectable, Scope } from '@nestjs/common';
import { CalculateQuoteDto } from './dto/calculate-quote.dto';
import { Quote } from './entities/quote.entity';
import { MonthlyQuoteStrategy } from './strategies/monthly-quote.strategy';
import { FortnightlyQuoteStrategy } from './strategies/fortnightly-quote.strategy';
import { QuoteExpirationDateService } from './strategies/quote-expiration-date.service';


import { QUOTE_STRATEGIES } from '../shared/constants/quote.constants';
import { WeeklyQuoteStrategy } from './strategies/weekly-quotestrategy';
import { DailyQuoteStrategy } from './strategies/daily-quote.strategy';


@Injectable({ scope: Scope.REQUEST })
export class QuoteService {

    constructor(private readonly quoteStrategyService: QuoteExpirationDateService) {}

    async calculate(dto: CalculateQuoteDto): Promise<Quote[]> {
        const { amount, frequency, numberQuotes, interestRate } = dto;


        let strategy;
        switch (frequency) {
            case QUOTE_STRATEGIES.MONTHLY :
                strategy = new MonthlyQuoteStrategy();
                break;
            case QUOTE_STRATEGIES.FORTNIGHTLY :
                strategy = new FortnightlyQuoteStrategy();
                break;
            case QUOTE_STRATEGIES.WEEKLY :
                strategy = new WeeklyQuoteStrategy();
                break;
            case QUOTE_STRATEGIES.DAILY :
                strategy = new DailyQuoteStrategy();
                break;
            default:
                throw new Error('Unsupported quote frequency');
                
        }

        this.quoteStrategyService.setStrategy(strategy)

        const quotes: Quote[] = [];
        const currentDate = new Date();

        let i = 1;
        while (i <= numberQuotes) {

            let quote = new Quote();
            quote.number = i;

            quote.expirationDate = await this.quoteStrategyService.calculate(currentDate, i);
            quote.interestValue = (amount * (interestRate / 100)) / numberQuotes;
            quote.value = amount / numberQuotes;
            quote.totalValue = quote.interestValue + quote.value

            quotes.push(quote)

            i++;
        }

        return quotes;
    }
}
