import { PaymentExpirationDateStrategy } from "./payment-strategy.interface";

export class FortnightlyPaymentStrategy implements PaymentExpirationDateStrategy {

    calculate(startDate: Date, paymentIndex: number): Date {
        const newDate = new Date(startDate);
        newDate.setDate(newDate.getDate() + paymentIndex * 14);
        return newDate;
    }

}


