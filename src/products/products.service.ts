import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import {
    CreateProductTypeDto,
    FindOneProductTypeDto,
    ProductTypeDto,
    UpdateProductTypeDto
} from "./dtos/product-type.dto";
import { CreateProductsDto, FindOneProductDto, FoundProductDto, ListProductsDto, UpdateProductsDto } from "./dtos/products.dto";
import { ProductTypeRawInterface, IProductTypeRepository } from "./interfaces/product-type-raw.interface";
import { IProductRepository, ProductRepositoryRaw } from "./interfaces/product-repository.interface";
import { ProductTypeMapper } from "./mappers/product-type.mapper";
import { RowFoundProductMapper } from "./mappers/products.mapper";
import { ProductDocument } from "./schemas/product.schema";
import { ProductTypeDoc } from "./schemas/product-type.schema";

@Injectable()
export class ProductsService {
    constructor(
        @Inject('IProductRepository')
        private readonly productsRepository: IProductRepository,
        @Inject('IProductTypeRepository')
        private readonly productTypeRepository: IProductTypeRepository
    ) {}

    async getAllProductsPaginated(data: ListProductsDto): Promise<ProductRepositoryRaw<FoundProductDto>> {
        const dataRawProducts: ProductRepositoryRaw<FoundProductDto> = await this.productsRepository.findAll(data);
        dataRawProducts.data = dataRawProducts.data.map((product) =>
            RowFoundProductMapper.toDto(product as unknown as ProductDocument)
        );
        return dataRawProducts;
    }

    async getProductByItem(data: FindOneProductDto): Promise<ProductDocument> {
        const product = await this.productsRepository.findProductByItem(data);

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async createProduct(data: CreateProductsDto): Promise<ProductDocument> {
        const [existingCode, productType] = await Promise.all([
            this.productsRepository.findProductByItem({ code: data.code }),
            this.productTypeRepository.findById(data.productType as string)
        ]);

        if (existingCode) {
            throw new ConflictException('Product code already exists');
        }

        if (!productType || productType.active === 0) {
            throw new NotFoundException('Product type not found or inactive');
        }

        data.code = data.code.trim().toUpperCase();
        data.name = data.name.trim();
        data.productType = new Types.ObjectId(data.productType as string);

        if (data.barcode) {
            data.barcode = data.barcode.trim();
        }

        if (data.brand) {
            data.brand = data.brand.trim();
        }

        if (data.model) {
            data.model = data.model.trim();
        }

        if (typeof data.active === 'undefined') {
            data.active = 1;
        }

        return await this.productsRepository.create(data);
    }

    async updateProduct(id: string, data: UpdateProductsDto): Promise<ProductDocument> {
        const productData = await this.productsRepository.findById(id);

        if (!productData?.id) {
            throw new NotFoundException('Product not found');
        }

        if (data.code) {
            const existingCode = await this.productsRepository.findProductByItem({ code: data.code });

            if (existingCode && existingCode.id !== id) {
                throw new ConflictException('Product code already exists');
            }

            data.code = data.code.trim().toUpperCase();
        }

        if (data.productType) {
            const productType = await this.productTypeRepository.findById(data.productType as string);

            if (!productType || productType.active === 0) {
                throw new NotFoundException('Product type not found or inactive');
            }

            data.productType = new Types.ObjectId(data.productType as string);
        }

        if (data.name) {
            data.name = data.name.trim();
        }

        if (data.barcode) {
            data.barcode = data.barcode.trim();
        }

        if (data.brand) {
            data.brand = data.brand.trim();
        }

        if (data.model) {
            data.model = data.model.trim();
        }

        const updatedData = { ...data } as Partial<UpdateProductsDto> & { id?: string };

        if (updatedData.id) {
            delete updatedData.id;
        }

        const productUpdated = await this.productsRepository.updateProduct(id, updatedData);

        if (!productUpdated) {
            throw new NotFoundException('Product not found');
        }

        return productUpdated;
    }

    async deleteProduct(id: string): Promise<{ message: string }> {
        const product = await this.productsRepository.findById(id);

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (product.active === 0) {
            throw new ConflictException('Product already deleted');
        }

        return await this.productsRepository.deleteProduct(id);
    }

    async getProductTypes(): Promise<ProductTypeRawInterface[]> {
        const productTypes = await this.productTypeRepository.findAll();

        if (productTypes.length === 0) {
            throw new NotFoundException('Product types not found');
        }

        return productTypes.map((type) => ProductTypeMapper.rawToDto(type));
    }

    async getProductTypeByItem(data: FindOneProductTypeDto): Promise<ProductTypeDto> {
        let productType: ProductTypeDoc | null = null;

        if (data.id) {
            productType = await this.productTypeRepository.findById(data.id);
        }

        if (!productType && data.name) {
            productType = await this.productTypeRepository.findByName(data.name);
        }

        if (!productType && data.code) {
            productType = await this.productTypeRepository.findByCode(data.code);
        }

        if (!productType || productType.active === 0) {
            throw new NotFoundException('Product type not found');
        }

        return ProductTypeMapper.toDto(productType);
    }

    async createProductType(data: CreateProductTypeDto): Promise<ProductTypeDto> {
        const [existingName, existingCode] = await Promise.all([
            this.productTypeRepository.findByName(data.name),
            this.productTypeRepository.findByCode(data.code)
        ]);

        if (existingName) {
            throw new ConflictException('Product type name already exists');
        }

        if (existingCode) {
            throw new ConflictException('Product type code already exists');
        }

        const created = await this.productTypeRepository.create({
            name: data.name.trim(),
            code: data.code.trim().toUpperCase(),
            notes: data.notes,
            active: typeof data.active === 'undefined' ? 1 : data.active
        });

        return ProductTypeMapper.toDto(created);
    }

    async updateProductType(data: UpdateProductTypeDto): Promise<ProductTypeDto> {
        const current = await this.productTypeRepository.findById(data.id);

        if (!current) {
            throw new NotFoundException('Product type not found');
        }

        if (data.name && data.name.trim() !== current.name) {
            const existingName = await this.productTypeRepository.findByName(data.name);
            if (existingName && existingName.id !== data.id) {
                throw new ConflictException('Product type name already exists');
            }
        }

        if (data.code && data.code.trim().toUpperCase() !== current.code) {
            const existingCode = await this.productTypeRepository.findByCode(data.code);
            if (existingCode && existingCode.id !== data.id) {
                throw new ConflictException('Product type code already exists');
            }
        }

        if (data.active === 0) {
            const productsCount = await this.productsRepository.countByProductType(data.id);
            if (productsCount > 0) {
                throw new ConflictException('Cannot disable product type with related products');
            }
        }

        const updated = await this.productTypeRepository.update(data.id, {
            name: data.name?.trim(),
            code: data.code?.trim().toUpperCase(),
            notes: data.notes,
            active: data.active
        });

        if (!updated) {
            throw new NotFoundException('Product type not found');
        }

        return ProductTypeMapper.toDto(updated);
    }

    async deleteProductType(id: string): Promise<{ message: string }> {
        const type = await this.productTypeRepository.findById(id);

        if (!type) {
            throw new NotFoundException('Product type not found');
        }

        if (type.active === 0) {
            throw new ConflictException('Product type already deleted');
        }

        const productsCount = await this.productsRepository.countByProductType(id);

        if (productsCount > 0) {
            throw new ConflictException('Cannot delete product type with related products');
        }

        return await this.productTypeRepository.delete(id);
    }

    async updateProductTypeStatus(id: string, active: number): Promise<ProductTypeDto> {
        const type = await this.productTypeRepository.findById(id);

        if (!type) {
            throw new NotFoundException('Product type not found');
        }

        if (type.active === active) {
            throw new ConflictException('Product type status is already set');
        }

        if (active === 0) {
            const productsCount = await this.productsRepository.countByProductType(id);
            if (productsCount > 0) {
                throw new ConflictException('Cannot disable product type with related products');
            }
        }

        const updated = await this.productTypeRepository.update(id, { active });

        if (!updated) {
            throw new NotFoundException('Product type not found');
        }

        return ProductTypeMapper.toDto(updated);
    }
}
