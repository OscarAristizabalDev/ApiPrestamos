import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { AuthUser } from "src/auth/decorators/auth-user.decorator";
import { CurrentUserDto } from "src/auth/dto/current-user.dto";
import { JwtAuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { CreateClientsDto, FindOneClientDto, UpdateClientsDto } from "./dtos/clients.dto";
import { ClientsService } from "./clients.service";
import { ClientMapper, RowFoundClientMapper } from "./mappers/clients.mapper";

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
    async getAllClients(@Query('page') page: string, @Query('limit') limit: string, @Query('search') search?: string){
        return await this.clientsService.getAllClientsPaginated({page: parseInt(page), limit: parseInt(limit), inputSearch: search});
    }

    @Post()
    async createClient(@AuthUser() actor: CurrentUserDto, @Body() clientDto: CreateClientsDto){
        if(!clientDto) throw new BadRequestException('No data found');
        const client = await this.clientsService.createClient(clientDto, actor);
        return ClientMapper.toDto(client);
    }

    @Put()
    async updateClient(@AuthUser() actor: CurrentUserDto, @Body() client: UpdateClientsDto){
        const clientUpdated = await this.clientsService.updateClient(client.id!, client, actor);
        return ClientMapper.toDto(clientUpdated);
    }

    @Delete(':id')
    async deleteClient(@AuthUser() actor: CurrentUserDto, @Param('id') idClient: string){
        return this.clientsService.deleteClient(idClient, actor);
    }
}