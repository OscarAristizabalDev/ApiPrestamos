import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoanController } from './infrastructure/http/controllers/loan.controller';
import { LoanSchema, LoanSchemaClass } from './infrastructure/persistence/mongo/schemas/loan.schema';
import { ClientLookupSchema, ClientLookupSchemaClass } from './infrastructure/persistence/mongo/schemas/client-lookup.schema';
import { ProductLookupSchema, ProductLookupSchemaClass } from './infrastructure/persistence/mongo/schemas/product-lookup.schema';
import { LoanRepository } from './infrastructure/persistence/mongo/loan.repository';
import { CreateLoanService } from './application/services/create-loan.service';
import { ListLoansService } from './application/services/list-loans.service';
import { GetLoanMetricsService } from './application/services/get-loan-metrics.service';
import { UpdateLoanService } from './application/services/update-loan.service';
import {
  CREATE_LOAN_USE_CASE,
  GET_LOAN_METRICS_USE_CASE,
  LIST_LOANS_USE_CASE,
  UPDATE_LOAN_USE_CASE,
} from './application/ports/incoming/tokens';
import { LOAN_REPOSITORY } from './application/ports/outgoing/tokens';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoanSchemaClass.name, schema: LoanSchema },
      { name: ClientLookupSchemaClass.name, schema: ClientLookupSchema },
      { name: ProductLookupSchemaClass.name, schema: ProductLookupSchema },
    ]),
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
    {
      provide: GET_LOAN_METRICS_USE_CASE,
      useClass: GetLoanMetricsService,
    },
    {
      provide: UPDATE_LOAN_USE_CASE,
      useClass: UpdateLoanService,
    },
  ],
  exports: [CREATE_LOAN_USE_CASE, LIST_LOANS_USE_CASE, GET_LOAN_METRICS_USE_CASE, UPDATE_LOAN_USE_CASE],
})
export class LoansModule {}
