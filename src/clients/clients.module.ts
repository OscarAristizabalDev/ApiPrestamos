import { Module } from "@nestjs/common";
import { ClientsController } from "./clients.controller";
import { ClientsService } from "./clients.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Client } from "./entities/clients.entity";
import { TypeDocument } from "./entities/type-document.entity";
import { Loans } from "src/loans/entities/loans.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Client, TypeDocument, Loans])],
    controllers: [ClientsController],
    providers: [ClientsService],
    exports: [ClientsService, TypeOrmModule]
})
export class ClientsModule{}