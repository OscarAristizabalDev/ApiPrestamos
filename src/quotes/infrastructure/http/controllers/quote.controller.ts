import { ModuleRef } from "@nestjs/core";
import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/auth.guard";

import { QuoteHttpMapper } from "../mappers/quote-http.mapper";
import { CalculateQuoteRequestDto } from "../dto/calculate-quote.request.dto";
import { QuoteResponseDto } from "../dto/quote-response.dto";
import { CALCULATE_QUOTE_USE_CASE } from "src/quotes/application/ports/incoming/tokens";
import { CalculateQuoteUseCase } from "src/quotes/application/ports/incoming/calculate-quote.use-case";

@ApiTags('Quotes/Cuotas')
@ApiBearerAuth()
@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuoteController {

    constructor(
        @Inject(CALCULATE_QUOTE_USE_CASE)
        private readonly useCase: CalculateQuoteUseCase
    ) { }

    @Post('calculate')
    @ApiCreatedResponse({ type: [QuoteResponseDto], description: 'Payment schedule, one entry per quote' })
    async calculate(@Body() dto: CalculateQuoteRequestDto) {
        const command = QuoteHttpMapper.toCommand(dto);
        const quotes = await this.useCase.calculate(command);
        return QuoteHttpMapper.toResponse(quotes);
    }
}
