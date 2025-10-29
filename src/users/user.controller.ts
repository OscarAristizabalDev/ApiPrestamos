import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/users.dto';
import { Users } from './users.entity';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UserMapper } from './mapper/user.mapper';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @Roles('admin')
    async findAll(): Promise<Partial<UserResponseDto>[]> {
        const users = await this.userService.findAll()
        return users.map(UserMapper.toDto);
    }

    @Get(':email')
    async findOne(@Param('email') email: string): Promise<Partial<UserResponseDto> | null> {
        const user = await this.userService.findOneByEmail(email)
        return user ? UserMapper.toDto(user) : null;
    }

    @Post()
    @Roles('admin')
    async create(@Body() userDto: CreateUserDto): Promise<Partial<UserResponseDto>> {
        const user = await this.userService.create(userDto as Users);
        return UserMapper.toDto(user);
    }

    @Put(':email')
    async update(@Param('email') email: string, @Body() userDto: UpdateUserDto): Promise<Partial<UserResponseDto> | null> {
        const userUpdated = await this.userService.update(email, userDto as Users);
        return userUpdated ? UserMapper.toDto(userUpdated) : null;
    }
    
    
    
}
