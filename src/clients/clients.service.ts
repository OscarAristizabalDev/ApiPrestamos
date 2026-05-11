import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { RowFoundClientMapper } from "./mappers/clients.mapper";
import { CreateClientsDto, FindOneClientDto, FoundClientDto, ListClientsDto, UpdateClientsDto } from "./dtos/clients.dto";
import { TypeDocumentMapper } from "./mappers/type-document.mapper";
import { ClientRepositoryRaw, IClientRepository } from "./interfaces/client-repository.interface";
import { ITypeDocumentRepository } from "./interfaces/type-document-raw.interface";
import { ClientDocument } from "./schemas/client.schema";
import { Types } from "mongoose";

@Injectable()
export class ClientsService{

    constructor(
        @Inject('IClientRepository')
        private readonly clientsRepository: IClientRepository,
        @Inject('ITypeDocumentRepository')
        private readonly documentTypesRepository: ITypeDocumentRepository,
    ){
    }

    async getAllClientsPaginated(data: ListClientsDto): Promise<ClientRepositoryRaw<FoundClientDto>>{
        const dataRawClients: ClientRepositoryRaw<FoundClientDto> = await this.clientsRepository.findAll(data);
        dataRawClients.data = dataRawClients.data.map(client => RowFoundClientMapper.toDto(client as unknown as ClientDocument));
        return dataRawClients;
    }

    async getClientByItem(datos: FindOneClientDto): Promise<ClientDocument>{
        const client = await this.clientsRepository.findClientByItem(datos);
        if(!client) throw new NotFoundException('Client not found');
        return client;
    }

    async createClient(client: CreateClientsDto): Promise<ClientDocument>{
        const clientEmail = await this.clientsRepository.findClientByItem({email: client.email});
        const clientDocument = await this.clientsRepository.findClientByItem({documentNumber: client.documentNumber});

        if(clientEmail){
            throw new ConflictException('The email already exists');
        }
        
        if(clientDocument){
            throw new ConflictException('Document number already exists');
        }

        client.fullName = `${client.names} ${client.surnames}`;

        client.typeDocument = new Types.ObjectId(client.typeDocument as string);

        client.registrationDate = new Date();

        return await this.clientsRepository.create(client);
    }

    async updateClient(id: string, client: UpdateClientsDto): Promise<ClientDocument>{
        console.info("[Service] Updating client: ", client);
        const clientData = await this.clientsRepository.findById(id);

        if (!clientData?.id) {
            throw new ConflictException('Client not found');
        }

        const existingEmail = await this.clientsRepository.findClientByItem({email: client.email});

        if (existingEmail && existingEmail.id !== id) {
            throw new ConflictException('Email already exists');
        }

        const existingDoc = await this.clientsRepository.findClientByItem({documentNumber: client.documentNumber});

        if (existingDoc && existingDoc.id !== id) {
            throw new ConflictException('Document number already exists');
        }

        const updatedData = {...client};

        if((updatedData as any).id) delete (updatedData as any).id;

        const updatedClient = await this.clientsRepository.updateClient(id, updatedData);

        console.info("[Service] Updated client: ", updatedClient);

        if(updatedClient === null) throw new NotFoundException('Client not found')

        return updatedClient;
    }

    async deleteClient(id: string){
        const client = await this.clientsRepository.findById(id);
        if(!client) throw new NotFoundException('Client not found');
        if(client.active === 0) throw new ConflictException('Client already deleted');
        return await this.clientsRepository.deleteClient(id);
    }

    async getDocumentTypes(){
        const typeDocuments = await this.documentTypesRepository.findAll();
        if(typeDocuments.length === 0) throw new NotFoundException('Document Types not Found');
        return typeDocuments.map(item => TypeDocumentMapper.rawToDto(item));
    }
}