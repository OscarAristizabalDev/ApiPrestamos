import { ApiPropertyOptional, OmitType, PartialType } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
    ArrayNotEmpty,
    IsArray,
    IsInt,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Max,
    Min,
    ValidateNested
} from "class-validator";
import { Types } from "mongoose";
import { ProductTypeDto } from "./product-type.dto";

export class ListProductsDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    inputSearch?: string;

    @IsOptional()
    @IsMongoId()
    productType?: string;

    @Type(() => Number)
    @IsInt({ message: 'La página debe ser un número entero' })
    @Min(1, { message: 'La página debe ser mayor o igual a 1' })
    page: number;

    @Type(() => Number)
    @IsInt({ message: 'El límite debe ser un número entero' })
    @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
    limit: number;
}

export class CreateProductsDto {
    @IsOptional()
    @IsString()
    id?: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    salePrice: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    stock: number;

    @IsNotEmpty()
    @IsString()
    code: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    costPrice?: number;

    @IsOptional()
    @IsString()
    barcode?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    brand?: string;

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    imageUrls?: string[];

    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    @IsString()
    productType: string | Types.ObjectId | unknown;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(1)
    active?: number;
}

export class FindOneProductDto {
    @ApiPropertyOptional({ description: 'Product ID', example: '681f9b8c91ca5e90f9b5b6d3' })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiPropertyOptional({ description: 'Product name', example: 'Laptop Lenovo ThinkPad' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Product search text', example: 'laptop' })
    @IsOptional()
    @IsString()
    inputSearch?: string;

    @ApiPropertyOptional({ description: 'Product code', example: 'LAP-001' })
    @IsOptional()
    @IsString()
    code?: string;
}

export class FoundProductDto {
    @Expose()
    readonly id: string | Types.ObjectId | unknown;

    @Expose()
    readonly name: string;

    @Expose()
    readonly salePrice: number;

    @Expose()
    readonly stock: number;

    @Expose()
    readonly code: string;

    @Expose()
    readonly costPrice?: number;

    @Expose()
    readonly barcode?: string;

    @Expose()
    readonly description?: string;

    @Expose()
    readonly brand?: string;

    @Expose()
    readonly model?: string;

    @Expose()
    readonly imageUrls?: string[];

    @Expose()
    readonly productType: ProductTypeDto;
}

export class ResponseProductDto {
    @Expose()
    readonly id: string | Types.ObjectId | unknown;

    @Expose()
    readonly name: string;

    @Expose()
    readonly code: string;

    @Expose()
    readonly salePrice: number;

    @Expose()
    readonly stock: number;
}

export class UpdateProductsDto extends PartialType(
    OmitType(CreateProductsDto, ['id'] as const)
) {
    @Type(() => Types.ObjectId)
    @IsNotEmpty()
    @IsMongoId()
    id: string;
}
