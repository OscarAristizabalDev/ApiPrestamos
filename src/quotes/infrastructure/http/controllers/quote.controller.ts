import { ModuleRef } from "@nestjs/core";
import { Body, Controller, Post } from "@nestjs/common";

import { QuoteService } from "src/quotes/application/services/quote.service";
import { CalculateQuoteRequestDto } from "../dto/calculate-quote.request.dto";
import { QuoteHttpMapper } from "../mappers/quote-http.mapper";

@Controller('quotes')
export class QuoteController {

    constructor(private readonly quotesService: QuoteService, private readonly moduleRef: ModuleRef) { }

    @Post('calculate')
    async calculate(@Body() dto: CalculateQuoteRequestDto) {
        const command = QuoteHttpMapper.toCommand(dto);
        const quotes = await this.quotesService.calculate(command);
        return QuoteHttpMapper.toResponse(quotes);
    }
}
