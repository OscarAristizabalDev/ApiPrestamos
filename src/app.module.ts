import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { SharedModule } from './shared/shared.module';
import { ClientsModule } from './clients/clients.module';
import { QuotesModule } from './quotes/quotes.module';
import { MongooseModule } from '@nestjs/mongoose';
import mongodbConfig from './config/database.config';
import * as passport from 'passport';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mongodbConfig],
      envFilePath: '.env'
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('mongodb');
        return {
          uri: config.uri,
          retryWrites: config.retryWrites,
          w: config.w,
          maxPoolSize: config.maxPoolSize,
          connectTimeoutMS: config.connectTimeoutMS,
          socketTimeoutMS: config.socketTimeoutMS,
          tlsAllowInvalidCertificates: true, // ojo sólo dev
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    QuotesModule,
    ClientsModule,
    SharedModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
