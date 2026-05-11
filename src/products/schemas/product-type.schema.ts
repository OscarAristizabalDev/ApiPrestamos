import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductTypeDoc = ProductType & Document;

@Schema({ timestamps: true })
export class ProductType {
    @Prop({ required: true, trim: true, unique: true, index: true })
    name: string;

    @Prop({ required: true, trim: true, uppercase: true, unique: true, index: true })
    code: string;

    @Prop()
    notes: string;

    @Prop({ default: 1 })
    active: number;
}

export const ProductTypeSchema = SchemaFactory.createForClass(ProductType);
