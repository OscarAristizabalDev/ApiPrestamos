import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
    @Prop({ required: true, trim: true, index: true })
    name: string;

    @Prop({ required: true, min: 0 })
    salePrice: number;

    @Prop({ required: true, min: 0 })
    stock: number;

    @Prop({ required: true, trim: true, uppercase: true, unique: true, index: true })
    code: string;

    @Prop({ min: 0 })
    costPrice: number;

    @Prop({ trim: true })
    barcode: string;

    @Prop({ trim: true })
    description: string;

    @Prop({ trim: true })
    brand: string;

    @Prop({ trim: true })
    model: string;

    @Prop({ type: [String], default: [] })
    imageUrls: string[];

    @Prop({ type: Types.ObjectId, ref: 'ProductType', required: true })
    productType: Types.ObjectId;

    @Prop({ default: 1 })
    active: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
