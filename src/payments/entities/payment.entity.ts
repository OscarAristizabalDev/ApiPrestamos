import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'payments'})
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    number: number;
    
    @Column()
    expirationDate: Date;
    
    @Column()
    interestValue: number;

    @Column()
    value: number;

    @Column()
    totalValue: number;
}
export class PaymentLoan {
    number: number;
    expirationDate: Date;
    interestValue: number
    value: number;
    totalValue: number
}
