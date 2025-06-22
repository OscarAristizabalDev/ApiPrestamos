import { Body, Controller, Post, } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { QuotesService } from './quotes.service';
import { CalculateQuoteDto } from './dto/calculate-quote.dto';

@Controller('quotes')
export class QuotesController {

    constructor(private readonly quotesService: QuotesService, private readonly moduleRef: ModuleRef) { }

    @Post('calculate')
    async calculate(@Body() dto: CalculateQuoteDto) {
        return await this.quotesService.calculate(dto);
    }
}
