import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoansService } from "./loans.service";
import { LoansController } from "./infrastructure/http/controllers/loan.controller";

@Module({
    imports: [],
    controllers: [LoansController],
    providers: [LoansService],
    exports: [LoansService, TypeOrmModule]
})
export class LoansModule{}