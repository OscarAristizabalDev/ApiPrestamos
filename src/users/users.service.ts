import { ConflictException, Inject, Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { IUserRepository, UserRepositoryRaws } from "./interfaces/user.interface";
import { CreateUserDto, FoundUserDto, ListUsersDto, SearchTerms, UpdateUserDto } from "./dto/users.dto";
import { RowFoundUserMapper } from "./mapper/user.mapper";
import { UserDocument } from "./schemas/user.schema";
@Injectable()
export class UserService {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) {}

    async findAll(data: ListUsersDto): Promise<UserRepositoryRaws<FoundUserDto>> {
        const dataRawClients: UserRepositoryRaws<FoundUserDto> = await this.userRepository.findAll(data);
        dataRawClients.data = dataRawClients.data.map(client => RowFoundUserMapper.toDto(client as unknown as UserDocument));
        return dataRawClients;
    }

    async findOneById(id: string): Promise<UserDocument | null> {
        return await this.userRepository.findOne({id});
    }

    async findOneByTerm(terms: SearchTerms): Promise<UserDocument | null> {
        return await this.userRepository.findOne(terms);
    }

    async findOneByEmail(email: string): Promise<UserDocument | null> {
        return await this.userRepository.findOne({email});
    }

    async create(user: CreateUserDto): Promise<UserDocument> {
        const userExists = await this.userRepository.findOne({email: user.email});
        if (userExists) {
            throw new ConflictException('El usuario ya existe');
        }
        user.password = await bcrypt.hash(user.password, 10);
        const userCreated = await this.userRepository.create(user);
        if(!userCreated) throw new ConflictException('User couldnt be created');
        return userCreated; 
    }

    async update(id: string, user: UpdateUserDto): Promise<UserDocument | null> {        
        return await this.userRepository.update(id, user);
    }
    
    async delete(id: string): Promise<string> {
        return await this.userRepository.delete(id);
    }   

    async updateRefreshToken(userId: string, token: string) {
        await this.userRepository.updateUserRefreshToken(userId, token);
    }
}