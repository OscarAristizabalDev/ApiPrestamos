import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Client } from "./entities/clients.entity";
import { ConfigService } from "@nestjs/config";
import { Not, Repository } from "typeorm";
import { ClientMapper, RowFoundClientMapper } from "./mappers/clients.mapper";
import { CreateClientsDto, FindOneClientDto, ResponseClientsDto, UpdateClientsDto } from "./dtos/clients.dto";
import { TypeDocument } from "./entities/type-document.entity";
import { TypeDocumentMapper } from "./mappers/type-document.mapper";

@Injectable()
export class ClientsService{
    private readonly defaultLimit: number;

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Client)
        private readonly clientsRepository: Repository<Client>,
        @InjectRepository(TypeDocument)
        private readonly documentTypesRepository: Repository<TypeDocument>,
    ){
        this.defaultLimit = +this.configService.get<number>('PAGINATION_LIMIT', 10);
    }

    async getAllClientsPaginated(page: number, limit: number){
        const take = limit ?? this.defaultLimit;
        const skip = (page - 1) * take;

        const [clients, total] = await this.clientsRepository.findAndCount({where:{active: Not(0)},
            skip,
            take,
            order: {created_at: 'DESC'},
        });

        return {
            data: clients.map((cl) => ClientMapper.toDto(cl)),
            total,
            page,
            limit: take,
            totalPages: Math.ceil(total / take),
          };
    }

    async getClientByItem(datos: FindOneClientDto){
        const query = this.clientsRepository.createQueryBuilder('clients')
            .where('clients.active = :active',{ active: 1 });

        if(datos.id) query.andWhere('clients.id = :id', { id: datos.id })
        
        if(datos.email) query.andWhere('clients.email = :email', { email: datos.email });

        if(datos.document) query.andWhere('clients.document_number = :document_number', { document_number: datos.document });

        const user = await query.getOne();

        if(!user) throw new BadRequestException('No Client Found');
    
        return user;
    }

    async getDocumentTypes(page: number, limit: number){
        const take = limit ?? this.defaultLimit;
        const skip = (page - 1) * take;

        const [documentTypes, total] = await this.documentTypesRepository.findAndCount({
            skip,
            take,
            order: {created_at: 'DESC'},
        });

        return {
            data: TypeDocumentMapper.rawToDtoList(documentTypes),
            total,
            page,
            limit: take,
            totalPages: Math.ceil(total / take),
          };
    }

    async createClient(client: CreateClientsDto){
        const clientEmail = await this.clientsRepository.findOne({where: {email: client.email}});
        const clientDocument = await this.clientsRepository.findOne({where: {document_number: client.document_number}});

        if(clientEmail){
            throw new ConflictException('El correo ya se encuentra registrado');
        }
        
        if(clientDocument){
            throw new ConflictException('Ya hay un cliente registrado con este número de documento');
        }

        const clientCreated = this.clientsRepository.create({...client, active: 1});

        return this.clientsRepository.save(clientCreated);
    }

    async updateClient(client: UpdateClientsDto){
        const clientData = await this.clientsRepository.findOne({where: {email: client.email}});

        if(client.email === clientData?.email){
            throw new ConflictException('El correo ya se encuentra registrado');
        }

        if (!clientData?.id) {
            throw new ConflictException('Cliente no encontrado');
        }
        return await this.clientsRepository.update(clientData.id, client);
    }

    async deleteClient(idClient: number){
        const user = await this.clientsRepository.findOne({where: {id: idClient}});
        if(!user) throw new BadRequestException('Client not found');
        const result = await this.clientsRepository
                .createQueryBuilder()
                .update(Client)
                .set({ active: 0 })
                .where('id = :id', { id: idClient })
                // .returning(["id", "updated_at"]) // pide el return explícitamente
                .execute();

        if(result.affected! > 0) return {message: 'Se ha eliminado el Cliente'};
        else return {message: 'No se han afectado registros'};
    }
}