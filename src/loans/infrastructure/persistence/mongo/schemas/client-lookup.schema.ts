import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClientLookupDocument = ClientLookupSchemaClass & Document;

// Local read-only projection of the `clients` collection; keeps loans decoupled from the clients module.
@Schema({ collection: 'clients' })
export class ClientLookupSchemaClass {
    @Prop()
    active: number;
}

export const ClientLookupSchema = SchemaFactory.createForClass(ClientLookupSchemaClass);
