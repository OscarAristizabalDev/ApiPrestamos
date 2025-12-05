import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TypeDocumentDoc = TypeDocument & Document;

@Schema({ timestamps: true })
export class TypeDocument {
    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    active: number;
}

export const TypeDocumentSchema = SchemaFactory.createForClass(TypeDocument);