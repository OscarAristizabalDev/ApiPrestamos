import { Injectable } from "@nestjs/common";
import { QuoteAmortization } from "src/quotes/domain/enums/quote-amortization.enum";
import { AmericanQuoteAmortization } from "src/quotes/domain/strategies/amortization/american-quote-amortization.strategy";
import { FrenchQuoteAmortization } from "src/quotes/domain/strategies/amortization/french-quote-amortization.strategy";
import { GermanQuoteAmortization } from "src/quotes/domain/strategies/amortization/german-quote-amortization.strategy";
import { QuoteAmortizationStrategy } from "src/quotes/domain/strategies/amortization/quote-amortization-strategy.interface";


@Injectable()
export class QuoteAmortizationStrategyResolver {

    constructor(
        private readonly french: FrenchQuoteAmortization,
        private readonly german: GermanQuoteAmortization,
        private readonly american: AmericanQuoteAmortization
    ){}

    resolve(amortization: QuoteAmortization): QuoteAmortizationStrategy {
        switch (amortization) {
            case QuoteAmortization.FRENCH:
                return this.french;
            case QuoteAmortization.GERMAN:
                return this.german;
            case QuoteAmortization.AMERICAN:
                return this.american;
            default:
                throw new Error("Unsupported quote amortization");
        }
    }
}