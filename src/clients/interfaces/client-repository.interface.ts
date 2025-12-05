import { CreateClientsDto, FindOneClientDto, ListClientsDto, UpdateClientsDto } from "../dtos/clients.dto";
import { ClientDocument } from "../schemas/client.schema";

export interface IClientRepository{
    create(data: CreateClientsDto): Promise<ClientDocument>;
    findById(id: string): Promise<ClientDocument>;
    findAll<T>(data: ListClientsDto): Promise<ClientRepositoryRaw<T>>;
    findClientByItem(data: FindOneClientDto): Promise<ClientDocument | null>;
    updateClient(id: string, data: UpdateClientsDto): Promise<ClientDocument | null>;
    deleteClient(id: string): Promise<{message:string}>;
}

export interface ClientRepositoryRaw<T>{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ClientSearchTermsRaw{
    documentNumber?: {$regex: string, $options: string}, 
    email?: {$regex: string, $options: string}, 
    fullName?: {$regex: string, $options: string}
}

export enum ROLEACCESS{
    MIDACCESS = 'admin'
}