import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Users } from "./users.entity";
import * as bcrypt from 'bcrypt';
import { add } from "date-fns";
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(Users)
        private readonly userRepository: Repository<Users>,
    ) {}

    async findAll(): Promise<Users[]> {
        return await this.userRepository.find();
    }

    async findOneById(id: string): Promise<Users | null> {
        return await this.userRepository.findOne({ where: { id: Number(id) } });
    }

    async findOneByEmail(email: string): Promise<Users | null> {
        return await this.userRepository.findOne({ where: { email } });
    }

    async create(user: Users): Promise<Users> {
        const userExists = await this.userRepository.findOne({ where: { email: user.email } });
        if (userExists) {
            throw new ConflictException('El usuario ya existe');
        }
        user.password = await bcrypt.hash(user.password, 10);
        return await this.userRepository.save(user);
    }

    async update(email: string, user: Users): Promise<Users | null> {
        await this.userRepository.update(user.id, user);
        return await this.userRepository.findOne({ where: { email } });
    }
    
    async delete(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }   

    async updateRefreshToken(userId: string, token: string) {
        await this.userRepository.update(userId, { refreshToken: token, refreshTokenExpiresAt: add(new Date(), { days: 1 }) });
      }
    
      async validateRefreshToken(user: Users, token: string): Promise<boolean> {
        return bcrypt.compare(token, user.refreshToken);
      }
    
      async removeRefreshToken(userId: string) {
        await this.userRepository.update(userId, { refreshToken: undefined });
      }
}