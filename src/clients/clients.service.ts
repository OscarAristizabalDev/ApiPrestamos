import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { RowFoundClientMapper } from "./mappers/clients.mapper";
import { CreateClientsDto, FindOneClientDto, FoundClientDto, ListClientsDto, UpdateClientsDto } from "./dtos/clients.dto";
import { TypeDocumentMapper } from "./mappers/type-document.mapper";
import { ClientRepositoryRaw, IClientRepository } from "./interfaces/client-repository.interface";
import { ITypeDocumentRepository } from "./interfaces/type-document-raw.interface";
import { ClientDocument } from "./schemas/client.schema";

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

        return await this.clientsRepository.create(client);
    }

    async updateClient(id: string, client: UpdateClientsDto): Promise<ClientDocument>{
        const clientData = await this.clientsRepository.findById(id);

        if (!clientData?.id) {
            throw new ConflictException('Client not found');
        }

        if(client.email === clientData?.email){
            throw new ConflictException('Email already exists');
        }
        const updatedData = {...client};

        delete updatedData.id;

        const updatedClient = await this.clientsRepository.updateClient(id, updatedData);

        if(updatedClient === null) throw new NotFoundException('Client not found')

        return updatedClient;
    }

    async deleteClient(id: string){
        return await this.clientsRepository.deleteClient(id);
    }

    async getDocumentTypes(){
        const typeDocuments = await this.documentTypesRepository.findAll();
        if(typeDocuments.length === 0) throw new NotFoundException('Document Types not Found');
        return typeDocuments.map(item => TypeDocumentMapper.rawToDto(item));
    }
}