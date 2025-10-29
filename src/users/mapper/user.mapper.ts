import { Users } from "../users.entity";
import { UserResponseDto } from "../dto/users.dto";

export class UserMapper {
    static toDto(user: Users): Partial<UserResponseDto> {
        return {
            email: user.email,
            names: user.names,
            surnames: user.surnames,
            phoneNumber: user.phoneNumber,
        };
    }
}