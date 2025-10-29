import { Users } from "src/users/users.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// refresh-token.entity.ts
@Entity({ name:'refresh_tokens' })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.refreshTokens)
  user: Users;

  @Column()
  token: string;

  @Column()
  expires: Date;

  @Column({ default: false })
  revoked: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;
}