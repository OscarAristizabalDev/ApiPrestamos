import { FoundUserDto, UserResponseDto } from "../dto/users.dto";
import { UserDocument } from "../schemas/user.schema";

export class UserMapper {
    static toDto(user: UserDocument): Partial<UserResponseDto> {
        return {
            id: user.id,
            email: user.email,
            names: user.names,
            surnames: user.surnames,
            phoneNumber: user.phoneNumber,
        };
    }
}

export class RowFoundUserMapper{
    static toDto(user: UserDocument): FoundUserDto {
        return {
          id: user._id,
          names: user.names,
          surnames: user.surnames,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          registrationDate: user.birthdate.toISOString(),
          role: user.role
        };
      }
}