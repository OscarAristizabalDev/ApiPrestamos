import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoansController } from "./loans.controller";
import { LoansService } from "./loans.service";

@Module({
    imports: [],
    controllers: [LoansController],
    providers: [LoansService],
    exports: [LoansService, TypeOrmModule]
})
export class LoansModule{}