import { CreateProductsDto, FindOneProductDto, ListProductsDto, UpdateProductsDto } from "../dtos/products.dto";
import { ProductDocument } from "../schemas/product.schema";

export interface IProductRepository {
    create(data: CreateProductsDto): Promise<ProductDocument>;
    findById(id: string): Promise<ProductDocument>;
    findAll<T>(data: ListProductsDto): Promise<ProductRepositoryRaw<T>>;
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
