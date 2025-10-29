import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Loans } from "./entities/loans.entity";
import { LoansController } from "./loans.controller";
import { LoansService } from "./loans.service";
import { Client } from "src/clients/entities/clients.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Loans, Client])],
    controllers: [LoansController],
    providers: [LoansService],
    exports: [LoansService, TypeOrmModule]
})
export class LoansModule{}