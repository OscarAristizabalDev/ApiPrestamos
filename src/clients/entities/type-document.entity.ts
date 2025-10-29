import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Client } from "./clients.entity";

@Entity('type_document')
export class TypeDocument{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  description: string;

  @Column({ type: 'int', default: 1 })
  active: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => Client, (client) => client.type_document_id)
  clients: Client[];
}