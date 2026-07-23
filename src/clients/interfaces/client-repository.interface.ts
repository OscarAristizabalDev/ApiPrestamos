import { Types } from "mongoose";
import { CreateClientsDto, FindOneClientDto, ListClientsDto, UpdateClientsDto } from "../dtos/clients.dto";
import { ClientDocument } from "../schemas/client.schema";

/** Campos de propiedad que fija el servidor al crear (no vienen del cliente). */
export interface ClientOwnershipFields {
    createdBy?: Types.ObjectId | null;
}

export type CreateClientData = CreateClientsDto & ClientOwnershipFields;

export interface IClientRepository{
    create(data: CreateClientData): Promise<ClientDocument>;
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
    fullName?: {$regex: string, $options: string},
    inputSearch?: {$regex: string, $options: string}
}

export enum ROLEACCESS{
    MIDACCESS = 'admin'
}