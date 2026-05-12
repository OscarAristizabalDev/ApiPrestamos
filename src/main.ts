import 'reflect-metadata';
//import { setServers } from 'node:dns';
//setServers(['8.8.8.8', '1.1.1.1']);
import { NestFactory } from '@nestjs/core';
import cookie from '@fastify/cookie';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  const configService = app.get(ConfigService);  

  app.use(cookieParser());
  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'secret',
  });
  app.use(helmet());
  // Logger para ver todas las peticiones
  /*app.use((req, res, next) => {
    console.log('=================================');
    console.log('🕐 Timestamp:', new Date().toISOString());
    console.log('🌐 IP:', req.ip || req.connection.remoteAddress);
    console.log('📡 Method:', req.method);
    console.log('🔗 URL:', req.url);
    console.log('📨 Headers:', {
      origin: req.headers.origin,
      host: req.headers.host,
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
      authorization: req.headers.authorization ? 'Bearer [HIDDEN]' : undefined
    });
    console.log('=================================');
    next();
  });*/
  app.enableCors({
    origin:[
      //'http://localhost:4200', // Frontend mobileweb
      'http://localhost:3001', // Frontend web
      'https://sirenically-slippiest-lylah.ngrok-free.dev', // Frontend mobile - Ver docs de NGROK para uso local de expo
    ], 
    credentials: true
  })

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // elimina campos no declarados en el Dto
    forbidNonWhitelisted: true, // lanza error si mandan un campo extra
    transform: true // convierte a tipos declarados en Dto (ej: string -> number)
  }))

  // Configuracino Swagger
  const configSawgger = new DocumentBuilder()
  .setTitle('API Auth JWT Refresh')
  .setDescription('Documentación para la autenticación con JWT y Refresh Tokens')
  .setVersion('1.0')
  .addCookieAuth('refreshToken')
  .build();

  const document = SwaggerModule.createDocument(app, configSawgger);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('PORT') || 3000;
  
  await app.listen(port);
}


bootstrap();
