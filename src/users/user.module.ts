import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { UserController } from './user.controller';
import { UserService } from './users.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UsersModule {}