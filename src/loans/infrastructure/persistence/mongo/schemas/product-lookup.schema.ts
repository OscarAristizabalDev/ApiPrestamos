import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductLookupDocument = ProductLookupSchemaClass & Document;

// Local read-only projection of the `products` collection; keeps loans decoupled from the products module.
@Schema({ collection: 'products' })
export class ProductLookupSchemaClass {
    @Prop()
    active: number;
}

export const ProductLookupSchema = SchemaFactory.createForClass(ProductLookupSchemaClass);
