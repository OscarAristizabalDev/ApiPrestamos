import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './repositories/user.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    forwardRef(()=>AuthModule),
    MongooseModule.forFeature([
      {name: User.name, schema: UserSchema}
  ])
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    }
  ],
  exports: [UserService, MongooseModule],
})
export class UsersModule {}