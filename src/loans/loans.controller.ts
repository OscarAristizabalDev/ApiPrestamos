import { BadRequestException, Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';
import { CurrentUserDto } from 'src/auth/dto/current-user.dto';
import { LoanMapper } from './mappers/loans.mapper';

@ApiTags('Loans/Prestamos')
@Controller('loans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoansController {
    constructor(private readonly loansService: LoansService){}

    @Post()
    async createLoan(@Body() bodyLoan: CreateLoanDto, @AuthUser() user: CurrentUserDto){
        if (!bodyLoan || Object.keys(bodyLoan).length === 0) {
            throw new BadRequestException('El cuerpo de la petición no puede estar vacío');
        }

        const loan = await this.loansService.createLoan({...bodyLoan, approved_by: user.id});
        return LoanMapper.toDto(loan);
    }
}