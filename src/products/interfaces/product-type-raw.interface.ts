import { ProductTypeDoc } from "../schemas/product-type.schema";

export interface ProductTypeRawInterface {
    id: string;
    name: string;
    code: string;
    notes?: string;
    active?: number;
}

export interface IProductTypeRepository {
    findAll(): Promise<ProductTypeDoc[]>;
    findById(id: string): Promise<ProductTypeDoc | null>;
    findByName(name: string): Promise<ProductTypeDoc | null>;
    findByCode(code: string): Promise<ProductTypeDoc | null>;
    create(data: { name: string; code: string; notes?: string; active?: number }): Promise<ProductTypeDoc>;
    update(id: string, data: { name?: string; code?: string; notes?: string; active?: number }): Promise<ProductTypeDoc | null>;
    delete(id: string): Promise<{ message: string }>;
}
