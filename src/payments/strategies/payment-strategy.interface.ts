export interface PaymentExpirationDateStrategy {    
    calculate(startDate: Date, paymentIndex: number): Date;
}
    