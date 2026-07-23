import { Types } from "mongoose";
import { Actor } from "../../auth/ownership";
import { CreateProductsDto, FindOneProductDto, ListProductsDto, UpdateProductsDto } from "../dtos/products.dto";
import { ProductDocument } from "../schemas/product.schema";

/** Campos de propiedad que fija el servidor al crear (no vienen del cliente). */
export interface ProductOwnershipFields {
    createdBy?: Types.ObjectId | null;
    shared?: boolean;
}

export type CreateProductData = CreateProductsDto & ProductOwnershipFields;

export interface IProductRepository {
    create(data: CreateProductData): Promise<ProductDocument>;
    findById(id: string): Promise<ProductDocument>;
    findAll<T>(data: ListProductsDto, actor?: Actor): Promise<ProductRepositoryRaw<T>>;
    findProductByItem(data: FindOneProductDto): Promise<ProductDocument | null>;
    updateProduct(id: string, data: Partial<UpdateProductsDto>): Promise<ProductDocument | null>;
    deleteProduct(id: string): Promise<{ message: string }>;
    countByProductType(typeId: string): Promise<number>;
}

export interface ProductRepositoryRaw<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ProductSearchTermsRaw {
    name?: { $regex: string; $options: string };
    code?: { $regex: string; $options: string };
}
