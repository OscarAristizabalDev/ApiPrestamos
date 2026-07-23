import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from '../products/products.module';
import { AppRequest, RequestSchema } from './schemas/request.schema';
import { RequestsController } from './requests.controller';
import { RequestsGateway } from './requests.gateway';
import { RequestsService } from './requests.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AppRequest.name, schema: RequestSchema }]),
    JwtModule.register({}),
    ProductsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService, RequestsGateway],
})
export class RequestsModule {}
