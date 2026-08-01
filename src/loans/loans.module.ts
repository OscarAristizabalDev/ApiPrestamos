import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule } from 'src/clients/clients.module';
import { LoanController } from './infrastructure/http/controllers/loan.controller';
import { LoanSchema, LoanSchemaClass } from './infrastructure/persistence/mongo/schemas/loan.schema';
import { LoanRepository } from './infrastructure/persistence/mongo/loan.repository';
import { CreateLoanService } from './application/services/create-loan.service';
import { ListLoansService } from './application/services/list-loans.service';
import { CREATE_LOAN_USE_CASE, LIST_LOANS_USE_CASE } from './application/ports/incoming/tokens';
import { LOAN_REPOSITORY } from './application/ports/outgoing/tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LoanSchemaClass.name, schema: LoanSchema }]),
    ClientsModule,
  ],
  controllers: [LoanController],
  providers: [
    // Outgoing port adapter
    {
      provide: LOAN_REPOSITORY,
      useClass: LoanRepository,
    },

    // Application use cases
    {
      provide: CREATE_LOAN_USE_CASE,
      useClass: CreateLoanService,
    },
    {
      provide: LIST_LOANS_USE_CASE,
      useClass: ListLoansService,
    },
  ],
  exports: [CREATE_LOAN_USE_CASE, LIST_LOANS_USE_CASE],
})
export class LoansModule {}
