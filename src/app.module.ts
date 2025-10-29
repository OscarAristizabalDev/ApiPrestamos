import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentsModule } from './payments/payments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { SharedModule } from './shared/shared.module';
import { ClientsModule } from './clients/clients.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    AuthModule,
    UsersModule,
    ClientsModule,
    PaymentsModule,
    SharedModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
