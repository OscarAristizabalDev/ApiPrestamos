import { OmitType, PartialType } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";
import { Types } from "mongoose";

export class ProductTypeDto {
    @Expose()
    readonly id: string | Types.ObjectId | unknown;

    @Expose()
    readonly name: string;

    @Expose()
    readonly code: string;

    @Expose()
    readonly notes?: string;
}

export class CreateProductTypeDto {
    @IsOptional()
    @IsString()
    id?: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    code: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(1)
    active?: number;
}

export class UpdateProductTypeDto extends PartialType(
    OmitType(CreateProductTypeDto, ['id'] as const)
) {
    @IsNotEmpty()
    @IsMongoId()
    id: string;
}

export class FindOneProductTypeDto {
    @IsOptional()
    @IsMongoId()
    id?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    code?: string;
}

export class UpdateProductTypeStatusDto {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(1)
    active: number;
}
