import { ConflictException, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { FilterQuery, Model, Types } from "mongoose";
import { CreateProductsDto, FindOneProductDto, ListProductsDto, UpdateProductsDto } from "../dtos/products.dto";
import { ProductRepositoryRaw, IProductRepository } from "../interfaces/product-repository.interface";
import { Product, ProductDocument } from "../schemas/product.schema";

@Injectable({ scope: Scope.REQUEST })
export class ProductsRepository implements IProductRepository {
    private readonly defaultLimit: number;

    constructor(
        private readonly configService: ConfigService,
        @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>
    ) {
        this.defaultLimit = +this.configService.get<number>('PAGINATION_LIMIT', 10);
    }

    async create(data: CreateProductsDto): Promise<ProductDocument> {
        const newProduct = new this.productModel(data);
        return await newProduct.save();
    }

    async findAll<T = ProductDocument>(data: ListProductsDto): Promise<ProductRepositoryRaw<T>> {
        const take = data.limit ?? this.defaultLimit;
        const skip = (data.page - 1) * take;
        const searchTerms = this.validateSearchTerms(data);

        if (data.productType) {
            searchTerms.productType = this.generateObjectId(data.productType);
        }

        const query = { ...searchTerms, active: 1 };

        const [products, total] = await Promise.all([
            this.productModel
                .find(query)
                .populate('productType', 'name code notes')
                .skip(skip)
                .limit(take)
                .lean()
                .exec(),
            this.productModel.countDocuments(query).exec()
        ]);

        const dataRaw: ProductRepositoryRaw<T> = {
            data: products as T[],
            total,
            page: data.page,
            limit: take,
            totalPages: Math.ceil(total / take)
        };

        return dataRaw;
    }

    async findById(id: string): Promise<ProductDocument> {
        const objectId = this.generateObjectId(id);
        const product = await this.productModel.findById(objectId).populate('productType', 'name code notes').exec();

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async findProductByItem(data: FindOneProductDto): Promise<ProductDocument | null> {
        if (data.id !== null && data.id !== undefined) {
            const productId = this.generateObjectId(data.id);
            const product = await this.productModel.findById(productId).populate('productType', 'name code notes').exec();

            if (!product) {
                throw new NotFoundException('Product not found');
            }

            return product;
        }

        const searchTerms = this.validateSearchTerms(data);
        const product = await this.productModel
            .findOne({ ...searchTerms, active: 1 })
            .populate('productType', 'name code notes')
            .exec();

        if (!product) {
            return null;
        }

        return product;
    }

    async updateProduct(id: string, data: Partial<UpdateProductsDto>): Promise<ProductDocument | null> {
        const objectId = this.generateObjectId(id);

        return await this.productModel
            .findByIdAndUpdate(objectId, data, { new: true })
            .populate('productType', 'name code notes')
            .exec();
    }

    async deleteProduct(id: string): Promise<{ message: string }> {
        const objectId = this.generateObjectId(id);
        const deletedProduct = await this.productModel.findByIdAndUpdate(objectId, { active: 0 }, { new: true }).exec();

        if (!deletedProduct) {
            throw new NotFoundException('Product was not found');
        }

        return { message: 'Product deleted successfully' };
    }

    async countByProductType(typeId: string): Promise<number> {
        const objectId = this.generateObjectId(typeId);
        return await this.productModel.countDocuments({ productType: objectId, active: 1 }).exec();
    }

    private validateSearchTerms(data: ListProductsDto | FindOneProductDto): FilterQuery<ProductDocument> {
        const searchTerms: FilterQuery<ProductDocument> = {};

        if (data.inputSearch) {
            const sanitizedInputSearch = this.escapeRegExp(data.inputSearch);
            searchTerms.$or = [
                { name: { $regex: sanitizedInputSearch, $options: 'i' } },
                { code: { $regex: sanitizedInputSearch, $options: 'i' } }
            ];
            return searchTerms;
        }

        if (data.name) {
            const sanitizedName = this.escapeRegExp(data.name);
            searchTerms.name = { $regex: sanitizedName, $options: 'i' };
        }

        if (data.code) {
            const sanitizedCode = this.escapeRegExp(data.code);
            searchTerms.code = { $regex: sanitizedCode, $options: 'i' };
        }

        return searchTerms;
    }

    private escapeRegExp(text: string): string {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private generateObjectId(id: string): Types.ObjectId {
        if (!Types.ObjectId.isValid(id)) {
            throw new ConflictException('ID submited is not valid');
        }

        return new Types.ObjectId(id);
    }
}
