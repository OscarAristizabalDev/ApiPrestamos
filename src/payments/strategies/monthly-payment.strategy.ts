import { PaymentExpirationDateStrategy } from "./payment-strategy.interface";

export class MonthlyPaymentStrategy implements PaymentExpirationDateStrategy {

    calculate(startDate: Date, paymentIndex: number): Date {
        const newDate = new Date(startDate);
        newDate.setMonth(newDate.getMonth() + paymentIndex);
        return newDate;
    }
    
}
