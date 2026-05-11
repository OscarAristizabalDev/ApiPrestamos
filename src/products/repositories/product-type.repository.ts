import { ConflictException, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { IProductTypeRepository } from "../interfaces/product-type-raw.interface";
import { ProductType, ProductTypeDoc } from "../schemas/product-type.schema";

@Injectable({ scope: Scope.REQUEST })
export class ProductTypeRepository implements IProductTypeRepository {
    constructor(
        @InjectModel(ProductType.name) private readonly productTypeModel: Model<ProductTypeDoc>
    ) {}

    async findAll(): Promise<ProductTypeDoc[]> {
        return await this.productTypeModel.find({ active: 1 }).exec();
    }

    async findById(id: string): Promise<ProductTypeDoc | null> {
        const objectId = this.generateObjectId(id);
        return await this.productTypeModel.findById(objectId).exec();
    }

    async findByName(name: string): Promise<ProductTypeDoc | null> {
        return await this.productTypeModel.findOne({ name: name.trim() }).exec();
    }

    async findByCode(code: string): Promise<ProductTypeDoc | null> {
        return await this.productTypeModel.findOne({ code: code.trim().toUpperCase() }).exec();
    }

    async create(data: { name: string; code: string; notes?: string; active?: number }): Promise<ProductTypeDoc> {
        const newType = new this.productTypeModel(data);
        return await newType.save();
    }

    async update(id: string, data: { name?: string; code?: string; notes?: string; active?: number }): Promise<ProductTypeDoc | null> {
        const objectId = this.generateObjectId(id);
        return await this.productTypeModel.findByIdAndUpdate(objectId, data, { new: true }).exec();
    }

    async delete(id: string): Promise<{ message: string }> {
        const objectId = this.generateObjectId(id);
        const deleted = await this.productTypeModel.findByIdAndUpdate(objectId, { active: 0 }, { new: true }).exec();

        if (!deleted) {
            throw new NotFoundException('Product type was not found');
        }

        return { message: 'Product type deleted successfully' };
    }

    private generateObjectId(id: string): Types.ObjectId {
        const objectId = new Types.ObjectId(id);

        if (!Types.ObjectId.isValid(objectId)) {
            throw new ConflictException('ID submited is not valid');
        }

        return objectId;
    }
}
