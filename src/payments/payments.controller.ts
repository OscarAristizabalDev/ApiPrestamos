import { Body, Controller, Post, } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { PaymentsService } from './payments.service';
import { CalculatePaymentDto } from './dto/calculate-payment.dto';

@Controller('payments')
export class PaymentsController {

    constructor(private readonly paymentsService: PaymentsService, private readonly moduleRef: ModuleRef) { }

    @Post('calculate')
    async calculate(@Body() dto: CalculatePaymentDto) {
        return await this.paymentsService.calculate(dto);
    }
}
