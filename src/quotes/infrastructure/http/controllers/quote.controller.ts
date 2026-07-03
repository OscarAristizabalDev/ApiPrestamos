import { ModuleRef } from "@nestjs/core";
import { Body, Controller, Inject, Post } from "@nestjs/common";

import { QuoteHttpMapper } from "../mappers/quote-http.mapper";
import { CalculateQuoteRequestDto } from "../dto/calculate-quote.request.dto";
import { CALCULATE_QUOTE_USE_CASE } from "src/quotes/application/ports/incoming/tokens";
import { CalculateQuoteUseCase } from "src/quotes/application/ports/incoming/calculate-quote.use-case";

@Controller('quotes')
export class QuoteController {

    constructor(
        @Inject(CALCULATE_QUOTE_USE_CASE)
        private readonly useCase: CalculateQuoteUseCase, 
        private readonly moduleRef: ModuleRef
    ) { }

    @Post('calculate')
    async calculate(@Body() dto: CalculateQuoteRequestDto) {
        const command = QuoteHttpMapper.toCommand(dto);
        const quotes = await this.useCase.calculate(command);
        return QuoteHttpMapper.toResponse(quotes);
    }
}
