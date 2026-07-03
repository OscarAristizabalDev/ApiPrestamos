import { Quote } from "src/quotes/domain/entities/quote.entity";
import { CalculateQuoteCommand } from "../../commands/calculate-quote.command";

export interface CalculateQuoteUseCase {
    
    calculate(command: CalculateQuoteCommand): Promise<Quote[]>
}