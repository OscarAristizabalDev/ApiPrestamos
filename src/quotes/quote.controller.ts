import { Body, Controller, Post, } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { QuoteService } from './quote.service';
import { CalculateQuoteDto } from './dto/calculate-quote.dto';

@Controller('quotes')
export class QuoteController {

    constructor(private readonly quotesService: QuoteService, private readonly moduleRef: ModuleRef) { }

    @Post('calculate')
    async calculate(@Body() dto: CalculateQuoteDto) {
        return await this.quotesService.calculate(dto);
    }
}
