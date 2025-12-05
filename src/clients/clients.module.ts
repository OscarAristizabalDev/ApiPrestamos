import { Module } from "@nestjs/common";
import { ClientsController } from "./clients.controller";
import { ClientsService } from "./clients.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Client, ClientSchema } from "./schemas/client.schema";
import { ClientsRepository } from './repositories/clients.repository';
import { TypeDocumentRepository } from "./repositories/type-document.repository";
import { TypeDocument, TypeDocumentSchema } from "./schemas/type-document-schema";

@Module({
    imports: [MongooseModule.forFeature([
        {name: Client.name, schema: ClientSchema},
        {name: TypeDocument.name, schema: TypeDocumentSchema}
    ])],
    controllers: [ClientsController],
    providers: [
        ClientsService,
        ClientsRepository,
        TypeDocumentRepository,
        {
            provide: 'IClientRepository',
            useClass: ClientsRepository,
        },
        {
            provide: 'ITypeDocumentRepository',
            useClass: TypeDocumentRepository,
        }
        ],
    exports: [ClientsService, MongooseModule]
})
export class ClientsModule{}