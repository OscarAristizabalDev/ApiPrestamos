import { ConflictException, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Mongoose, Types } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { IUserRepository, UserRepositoryRaws } from "../interfaces/user.interface";
import { User, UserDocument } from "../schemas/user.schema";
import { CreateUserDto, ListUsersDto, SearchTerms, UpdateUserDto } from "../dto/users.dto";


@Injectable({ scope: Scope.REQUEST })
export class UserRepository implements IUserRepository{
    private defaultLimit: number;
    constructor(
        private readonly configService: ConfigService,
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) {
        this.defaultLimit = +this.configService.get<number>('PAGINATION_LIMIT', 10);
    }

    async findAll<T = UserDocument>(data: ListUsersDto): Promise<UserRepositoryRaws<T>> {
        const take = data.limit ?? this.defaultLimit;
        const skip = (data.page - 1) * take;

        const [users, total] = await Promise.all([
            this.userModel
              .find(data.terms ? {...data.terms, fullName:{
                $regex: data.terms.fullName,
                $options: 'i'
              }, active:1} : {})
              .skip(skip)
              .limit(take)
              .exec(),
            this.userModel.countDocuments(data.terms ? {...data.terms, active:1} : {}).exec()
          ]);

        const dataRaw : UserRepositoryRaws<T> = {
            data: users as T[], 
            total, 
            page: data.page, 
            limit: take, 
            totalPages: Math.ceil(total / take)};

        return dataRaw;
    }

    async findOne(data: SearchTerms): Promise<UserDocument | null> {
        if(data.id){ 
            const userID = this.generateObjectId(data.id);
            return await this.userModel.findById(userID,{},{active: 1}).exec();
        }
        if(data.email != undefined && data.email !== null) {
            const normalizedEmail = data.email.trim();
            const userFound = await this.userModel.findOne({email: normalizedEmail, active: 1}).exec();
            if(!userFound) throw new NotFoundException('User not found or deleted');
            return userFound;
        }
        return null;
    }

    async create(data: CreateUserDto): Promise<UserDocument | null> {
        const user = new this.userModel(data);
        return await user.save();
    }

    async update(id: string, data: UpdateUserDto): Promise<UserDocument | null> {
        const userID = this.generateObjectId(id);        
        if(data.email){
            const emailExists = await this.userModel.findOne({email: data.email}).exec();
            if(emailExists) throw new ConflictException('Email already exists');
        }
        const updatedUser =  await this.userModel.findByIdAndUpdate(userID, {...data}, {new:true}).exec();
        if(!updatedUser) throw new NotFoundException('No user were found');
        return updatedUser;
    }

    async delete(id: string): Promise<string> {
        const userID = this.generateObjectId(id);
        const deletedClient = await this.userModel.findByIdAndUpdate(userID, {active: 0}, {new: true}).exec();
        if(!deletedClient) throw new NotFoundException('Client was not found');
        return 'Client deleted successfully';
    }

    async updateUserRefreshToken(id: string, token: string): Promise<UserDocument | null> {
        const userID = this.generateObjectId(id);
        const userRefreshTokenUpdated = await this.userModel.findByIdAndUpdate(userID,{refreshToken: token}, {new: true}).exec();
        if(!userRefreshTokenUpdated) throw new NotFoundException('User not found so no token were updated');
        return userRefreshTokenUpdated;
    }

    private generateObjectId(id:string):Types.ObjectId{
        let objectID;
        if(id !== null && id !== undefined) objectID = new Types.ObjectId(id);
        if(!Types.ObjectId.isValid(objectID)) throw new ConflictException('ID submited is not valid');

        return objectID;
    }
}