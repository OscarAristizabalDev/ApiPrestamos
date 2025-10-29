import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { AuthUser } from "src/auth/decorators/auth-user.decorator";
import { Roles } from "src/auth/decorators/roles.decorator";
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
    async getDocumentTypes(@Query('page') page: number, @Query('limit') limit: number){
        if(!page || !limit) throw new BadRequestException('Page or limit param not provided');
        return this.clientsService.getDocumentTypes(page,limit);
    } 

    @Get()
    async getClientsByUser(@AuthUser('id') userId: number){

    } 
    
    @Get('emaildoc')
    async getClientByItem(@Query() filters: FindOneClientDto){
        const user = await this.clientsService.getClientByItem(filters)
        return RowFoundClientMapper.toDto(user);
    }
    
    @Get('all')
    @Roles('admin')
    async getAllClients(@Query('page') page: number, @Query('limit') limit: number){
        if(!page || !limit) throw new BadRequestException('Page or limit param not provided');
        return this.clientsService.getAllClientsPaginated(page, limit);
    }

    @Post()
    async createClient(@Body() clientDto: CreateClientsDto){
        const client = await this.clientsService.createClient(clientDto);
        return ClientMapper.toDto(client);
    }

    @Put()
    async updateClient(@Body() client: UpdateClientsDto){
        const clientUpdated = await this.clientsService.updateClient(client);
        return ClientMapper.toDto(clientUpdated);
    }

    @Delete(':id')
    async deleteClient(@Param('id') idClient: number){
        return this.clientsService.deleteClient(idClient);
    }
}