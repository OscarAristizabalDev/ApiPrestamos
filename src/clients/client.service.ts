import { Injectable, Scope } from "@nestjs/common";
import { ClientRepository } from "./client.repository";
import { Client } from "./schemas/client.schema";

@Injectable({ scope: Scope.REQUEST })
export class ClientService {
    constructor(
        private readonly clientRepository: ClientRepository
    ) { }

    async create(data: Partial<Client>): Promise<Client> {
        return await this.clientRepository.create(data);
    }

    async findAll(): Promise<Client[]> {
        return await this.clientRepository.findAll();
    }

    async findById(id: string): Promise<Client | null> {
        return await this.clientRepository.findById(id);
    }

    async update(id: string, data: Partial<Client>): Promise<Client | null> {
        return await this.clientRepository.update(id, data);
    }

    async delete(id: string): Promise<Client | null> {
        return await this.clientRepository.delete(id);
    }

}