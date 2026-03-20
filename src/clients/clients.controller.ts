import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { CreateClientsDto, FindOneClientDto, UpdateClientsDto } from "./dtos/clients.dto";
import { ClientsService } from "./clients.service";
import { ClientMapper, RowFoundClientMapper } from "./mappers/clients.mapper";
import { ROLEACCESS } from "./interfaces/client-repository.interface";

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController{

    constructor(private readonly clientsService: ClientsService){}

    @Get('doctypes')
    async getDocumentTypes(){
        return await this.clientsService.getDocumentTypes();
    } 

    // @Get()
    // async getClientsByUser(@AuthUser('id') userId: number){

    // } 
    
    @Get('find')
    async getClientByItem(@Query() filters: FindOneClientDto){
        if(!filters) throw new BadRequestException('data to find not found');
        const user = await this.clientsService.getClientByItem(filters);
        return RowFoundClientMapper.toDto(user);
    }
    
    @Get('all')
    @Roles(ROLEACCESS.MIDACCESS)
    async getAllClients(@Query('page') page: string, @Query('limit') limit: string){      
        if(!page || !limit) throw new BadRequestException('Page or limit param not provided');
        return await this.clientsService.getAllClientsPaginated({page: parseInt(page), limit: parseInt(limit)});
    }

    @Post()
    async createClient(@Body() clientDto: CreateClientsDto){
        if(!clientDto) throw new BadRequestException('No data found');
        const client = await this.clientsService.createClient(clientDto);
        return ClientMapper.toDto(client);
    }

    @Put()
    async updateClient(@Body() client: UpdateClientsDto){
        if(!client) throw new BadRequestException('No Client body were found');
        if(!client.id) throw new BadRequestException('No id found in body request');
        const clientUpdated = await this.clientsService.updateClient(client.id, client);
        return ClientMapper.toDto(clientUpdated);
    }

    @Delete(':id')
    async deleteClient(@Param('id') idClient: string){
        if(!idClient) throw new BadRequestException('no client id found');
        return this.clientsService.deleteClient(idClient);
    }
}