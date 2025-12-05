import { CreateUserDto, ListUsersDto, SearchTerms, UpdateUserDto } from "../dto/users.dto";
import { UserDocument } from "../schemas/user.schema";

export interface IUserRepository{
    findAll<T>(data: ListUsersDto):Promise<UserRepositoryRaws<T>>;
    findOne(data: SearchTerms):Promise<UserDocument| null>;
    create(data: CreateUserDto):Promise<UserDocument | null>;
    update(id: string, data: UpdateUserDto):Promise<UserDocument | null>;
    delete(id: string):Promise<string>;
    updateUserRefreshToken(userID: string, token: string):Promise<UserDocument | null>;
}

export interface UserRepositoryRaws<T>{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}