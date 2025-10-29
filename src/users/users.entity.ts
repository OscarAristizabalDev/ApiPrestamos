import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RefreshToken } from "../auth/entities/refresh-tokens.entity";
import { Loans } from "src/loans/entities/loans.entity";

@Entity({ name: 'users' })
export class Users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    names: string;

    @Column()
    surnames: string;

    @Column({nullable: true, name: 'phone_number'})
    phoneNumber: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    city: string;

    @Column({ default: 'A' })
    status: string;

    @Column({ default: '00000', name: 'postal_code' })
    postalCode: string;
    
    @Column()
    birthdate: Date;

    @Column({ nullable: true })
    refreshToken: string;

    @OneToMany(() => RefreshToken, (token) => token.user)
    refreshTokens: RefreshToken[];

    @Column({ nullable: true })
    refreshTokenExpiresAt: Date;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ nullable: true })
    deletedAt: Date;

    @Column({ default: true })
    active: boolean;

    @Column({ default: 'user' })
    role: string;

    @OneToMany(() => Loans, (loan) => loan.approvedBy)
    approvedLoans: Loans[];    
}