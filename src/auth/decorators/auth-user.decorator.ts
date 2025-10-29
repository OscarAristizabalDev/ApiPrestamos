import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { CurrentUserDto } from "../dto/current-user.dto";

export const AuthUser = createParamDecorator(
    (data: keyof CurrentUserDto | undefined, ctx: ExecutionContext) =>{
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as CurrentUserDto;

        if(data){
            return user?.[data];
        }

        return user;
    }
)