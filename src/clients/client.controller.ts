import { Controller, Get, Param } from "@nestjs/common";


@Controller('clients')
export class ClientController {

    constructor() {

    }

    @Get()
    async findAll() {
        return []
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return null
    }

}