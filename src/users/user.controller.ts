import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto, FoundUserDto, ListUsersDto, SearchTerms, UpdateUserDto, UserResponseDto } from './dto/users.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UserMapper } from './mapper/user.mapper';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRepositoryRaws } from './interfaces/user.interface';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @Roles('admin')
    async findAll(@Query('data') data: string): Promise<UserRepositoryRaws<FoundUserDto>> {
        if(!data) throw new BadRequestException('Data for search not found');
        const decodedData: ListUsersDto = JSON.parse(atob(data));
        const users : UserRepositoryRaws<FoundUserDto>  = await this.userService.findAll(decodedData);
        return users;
    }

    @Get('find')
    async findOne(@Query('data') data: string): Promise<Partial<UserResponseDto> | null> {
        if(!data) throw new BadRequestException('Data for search not found');
        const terms: SearchTerms = JSON.parse(atob(data));
        const user = await this.userService.findOneByTerm(terms)
        return user ? UserMapper.toDto(user) : null;
    }

    @Post()
    @Roles('admin')
    async create(@Body() userDto: CreateUserDto): Promise<Partial<UserResponseDto>> {
        if(!userDto) throw new BadRequestException('no body data found');
        const user = await this.userService.create(userDto);
        return UserMapper.toDto(user);
    }

    @Put()
    async update(@Query('id') id: string, @Body() userDto: UpdateUserDto): Promise<Partial<UserResponseDto> | null> {
        const userUpdated = await this.userService.update(id, userDto);
        return userUpdated ? UserMapper.toDto(userUpdated) : null;
    }
    
    @Delete(':id')    
    async delete(@Param('id') id: string): Promise<string> {
        const userDeleted = await this.userService.delete(id);
        return userDeleted;
    }
}
