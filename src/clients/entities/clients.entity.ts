import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TypeDocument } from "./type-document.entity";
import { Loans } from "src/loans/entities/loans.entity";

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  names: string;

  @Column({ type: 'varchar', length: 100 })
  surnames: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_number: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  address: string;

  @Column({ type: 'date', nullable: true })
  birthdate: Date;

  
  @Column({ name: 'type_document_id' })
  type_document_id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  document_number: string;

  @Column({default: 1})
  active: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;

  // relación con loans
  @OneToMany(() => Loans, (loans) => loans.client)
  loans: Loans[];
}