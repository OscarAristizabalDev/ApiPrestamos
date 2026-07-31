import { BadRequestException, Body, Post } from "@nestjs/common";
import { CreateLoanRequestDto } from "../dto/create-loan.request.dto";

export class LoansController {

    constructor() { }

    @Post()
    async createLoan(@Body() loan: CreateLoanRequestDto) {

        // if (!loan || Object.keys(loan).length === 0) {
        //     throw new BadRequestException('El cuerpo de la petición no puede estar vacío');
        // }

        // const loan = await this.loansService.createLoan({ ...bodyLoan, approved_by: user.id });
    }
}