import { Injectable, Scope } from "@nestjs/common";
import { Client, ClientDocument } from './schemas/client.schema';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";


@Injectable({ scope: Scope.REQUEST })
export class ClientRepository {
    constructor(
        @InjectModel(Client.name) private clientModel: Model<ClientDocument>
    ) { }

    async create(data: Partial<Client>): Promise<Client> {
        const newClient = new this.clientModel(data);
        return newClient.save();
    }

    async findAll(): Promise<Client[]> {
        return this.clientModel.find().exec()
    }

    async findById(id: string): Promise<Client | null> {
        return this.clientModel.findById(id).exec();
    }

    async update(id: string, updateData: Partial<Client>): Promise<Client | null> {
        return this.clientModel.findByIdAndUpdate(id, updateData, { new: true }).exec()
    }

    async delete(id: string): Promise<Client | null>{
        return this.clientModel.findByIdAndDelete(id).exec()
    }
 }