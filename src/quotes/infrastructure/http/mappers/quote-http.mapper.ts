import { QuoteResponseDto } from "../dto/quote-response.dto";
import { Quote } from "src/quotes/domain/entities/quote.entity";
import { CalculateQuoteRequestDto } from "../dto/calculate-quote.request.dto";
import { CalculateQuoteCommand } from "src/quotes/application/commands/calculate-quote.command";

export class QuoteHttpMapper {

    static toCommand(dto: CalculateQuoteRequestDto): CalculateQuoteCommand {
        return new CalculateQuoteCommand(
            dto.amount,
            dto.frequency,
            dto.numberQuotes,
            dto.interestRate,
            dto.amortization
        );
    }

    static toResponse(quotes: Quote[]): QuoteResponseDto[] {
        return quotes.map(q => ({
            number: q.number,
            value: q.value,
            interestValue: q.interestValue,
            totalValue: q.totalValue,
            expirationDate: q.expirationDate.toISOString(),
        }));
    }
}