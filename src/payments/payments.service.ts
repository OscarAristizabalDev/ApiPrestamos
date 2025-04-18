import { Injectable, Scope } from '@nestjs/common';
import { CalculatePaymentDto } from './dto/calculate-payment.dto';
import { Payment } from './entities/payment.entity';
import { MonthlyPaymentStrategy } from './strategies/monthly-payment.strategy';
import { FortnightlyPaymentStrategy } from './strategies/fortnightly-payment.strategy';
import { PaymentExpirationDateService } from './strategies/payment-expiration-date.service';


import { PAYMENT_STRATEGIES } from '../shared/constants/payment.constants';


@Injectable({ scope: Scope.REQUEST })
export class PaymentsService {

    constructor(private readonly paymentStrategyService: PaymentExpirationDateService) {}

    async calculate(dto: CalculatePaymentDto): Promise<Payment[]> {
        const { amount, frequency, numberPayments, interestPercentage } = dto;


        let strategy;
        switch (frequency) {
            case PAYMENT_STRATEGIES.MONTHLY :
                strategy = new MonthlyPaymentStrategy();
                break;
            case PAYMENT_STRATEGIES.FORTNIGHTLY :
                strategy = new FortnightlyPaymentStrategy();
                break;
            default:
                throw new Error('Unsupported payment frequency');
                
        }

        this.paymentStrategyService.setStrategy(strategy)

        const payments: Payment[] = [];
        const currentDate = new Date();

        let i = 1;
        while (i <= numberPayments) {

            let payment = new Payment();
            payment.number = i;

            payment.expirationDate = await this.paymentStrategyService.calculate(currentDate, i);
            payment.interestValue = (amount * (interestPercentage / 100)) / numberPayments;
            payment.value = amount / numberPayments;
            payment.totalValue = payment.interestValue + payment.value

            payments.push(payment)

            i++;
        }

        return payments;
    }
}
