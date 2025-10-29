import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { Users } from "../users/users.entity";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RefreshToken } from "src/auth/entities/refresh-tokens.entity";
import { Payment } from "src/payments/entities/payment.entity";
import { Client } from "src/clients/entities/clients.entity";
import { Loans } from "src/loans/entities/loans.entity";
import { TypeDocument } from "src/clients/entities/type-document.entity";

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
    imports:[ConfigModule],
    inject:[ConfigService],
    useFactory: async (config: ConfigService) =>({
        type: config.get<'postgres'>('DB_TYPE'),
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<'string'>('DB_PORT') || '5432', 10),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [Users, Client, Loans, TypeDocument, RefreshToken, Payment],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: false,
    })
}