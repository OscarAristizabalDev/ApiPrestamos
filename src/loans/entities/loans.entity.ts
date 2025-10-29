import { Users } from "src/users/users.entity";
import { Client } from "src/clients/entities/clients.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'loans'})
export class Loans{
    @PrimaryGeneratedColumn()
  id: number;

  // relación con clientes
  @ManyToOne(() => Client, (client) => client.loans, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'COP' })
  currency: string;

  @Column('decimal', { precision: 5, scale: 2 })
  interest_rate: number;

  @Column('int')
  term: number;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ type: 'varchar', length: 10 })
  loan_type: string;

  // relación con usuarios internos (aprobador)
  @ManyToOne(() => Users, (user) => user.approvedLoans, { nullable: true, lazy: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: Users;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  pending_amount: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  payment_frecuency_id: string;

  @Column({ type: 'text', nullable: true })
  warranty: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;
}