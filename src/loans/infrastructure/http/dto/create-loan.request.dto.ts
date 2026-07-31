import { Type } from "class-transformer";
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsPositive, ValidateNested } from "class-validator";
import { AmortizationType } from "src/loans/domain/enums/amortization-type.enum";
import { PaymentFrequency } from "src/loans/domain/enums/payment-frequency.enum";
import { CustomerSnapshotDto } from "./customer-snapshot.request.dto";
import { ProductSnapshotDto } from "./product-snapshot.request.dto";


export class CreateLoanRequestDto {

    @IsMongoId()
    customerId: string;

    @ValidateNested()
    @Type(() => CustomerSnapshotDto)
    customerSnapshot: CustomerSnapshotDto;

    @IsNumber()
    @IsPositive()
    amount: number;

    @IsOptional()
    @IsMongoId()
    productId?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => ProductSnapshotDto)
    productSnapshot?: ProductSnapshotDto;

    @IsEnum(PaymentFrequency)
    frequency: PaymentFrequency;

    @IsNumber()
    @IsPositive()
    numberQuotes: number;

    @IsNumber()
    @IsPositive()
    interestRate: number;

    @IsEnum(AmortizationType)
    amortization: AmortizationType;
}
