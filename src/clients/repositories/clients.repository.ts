import { ConflictException, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { Client, ClientDocument } from '../schemas/client.schema';
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ClientRepositoryRaw, ClientSearchTermsRaw, IClientRepository } from "../interfaces/client-repository.interface";
import { CreateClientsDto, FindOneClientDto, ListClientsDto, UpdateClientsDto } from "../dtos/clients.dto";
import { ConfigService } from "@nestjs/config";


@Injectable({ scope: Scope.REQUEST })
export class ClientsRepository implements IClientRepository{
    private defaultLimit: number;
    constructor(
        private readonly configService: ConfigService,
        @InjectModel(Client.name) private clientModel: Model<ClientDocument>
    ) {
        this.defaultLimit = +this.configService.get<number>('PAGINATION_LIMIT', 10);
     }

    async create(data: CreateClientsDto): Promise<ClientDocument> {
        const newClient = new this.clientModel(data);
        return await newClient.save();
    }

    async findAll<T = ClientDocument>(data: ListClientsDto): Promise<ClientRepositoryRaw<T>> {
        const take = data.limit ?? this.defaultLimit;
        const skip = (data.page - 1) * take;
        const searchTerms = this.validateSearchTerms(data);

        const [clients, total] = await Promise.all([
            this.clientModel
              .find(searchTerms)
              .skip(skip)
              .limit(take)
              .exec(),
            this.clientModel.countDocuments({}).exec()
          ]);

        const dataRaw : ClientRepositoryRaw<T> = {
            data: clients as T[], 
            total, 
            page: data.page, 
            limit: take, 
            totalPages: Math.ceil(total / take)};

        return dataRaw;
    }

    async findById(id: string): Promise<ClientDocument>{
        const objectID = this.generateObjectId(id);
        const client = await this.clientModel.findById(objectID, {}, {active:1}).exec();
        if(!client) throw new NotFoundException('Client not found');
        return client;
    }

    async findClientByItem(data: FindOneClientDto): Promise<ClientDocument> {
        if(data.id !== null && data.id !== undefined) {
            const clientID = this.generateObjectId(data.id);
            const client = await this.clientModel.findById(clientID,{active: 1}).exec();
            if(!client) throw new NotFoundException('Client not found');
            return client;
        }
        const term = this.validateSearchTerms(data);
        const client = await this.clientModel.findOne({...term, active: 1}).exec();
        if(!client) throw new NotFoundException('Client not found');
        return client;
    }

    async updateClient(id: string, updateData: UpdateClientsDto): Promise<ClientDocument | null> {
        const objectID = this.generateObjectId(id);
        return await this.clientModel.findByIdAndUpdate(objectID, updateData, { new: true }).exec();
    }

    async deleteClient(id: string): Promise<{message:string}>{
        const objectID = this.generateObjectId(id);
        const deletedClient = await this.clientModel.findByIdAndUpdate(objectID, {active: 0}, {new: true}).exec();
        if(!deletedClient) throw new NotFoundException('Client was not found');
        return {message:'Client deleted successfully'};
    }

    validateSearchTerms(data: ListClientsDto | FindOneClientDto): ClientSearchTermsRaw{
        let searchTerms : ClientSearchTermsRaw = {};

        // Si se le agrega al inicio del regex el simbolo ^, esta consulta será al equivalente de
        // LIKE 'cadena%', pero si está al final el símbolo $, este equivaldrá a LIKE '%cadena'
        // por el contrario si no tiene ningún símbolo la consulta será equivalente a LIKE '%cadena%'
        if(data.documentNumber){ 
            const sanitizedDocumentNumber = this.escapeRegExp(data.documentNumber);
            searchTerms = {
                ...searchTerms, documentNumber: {
                    $regex: `^${sanitizedDocumentNumber}`,
                    $options: 'i'
                }
            };
        }
        if(data.email) {
            const sanitizedEmail = this.escapeRegExp(data.email);
            searchTerms = {
                ...searchTerms, email: {
                    $regex: sanitizedEmail,
                    $options: 'i'
                }        
            };
        }
        if(data.fullName) {
            const sanitizedFullName = this.escapeRegExp(data.fullName);
            searchTerms = {
                ...searchTerms, fullName: {
                    $regex: sanitizedFullName,
                    $options: 'i'
                }
            }
        }

        return searchTerms;
    }

    /**
     * Función para sanitizar textos suministrados desde request
     * @param text value suplied to sanitize
     * @returns string sanitized
     */
    private escapeRegExp(text: string): string {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private generateObjectId(id:string):Types.ObjectId{
        let objectID;
        if(id !== null && id !== undefined) objectID = new Types.ObjectId(id);
        if(!Types.ObjectId.isValid(objectID)) throw new ConflictException('ID submited is not valid');

        return objectID;
    }
 }