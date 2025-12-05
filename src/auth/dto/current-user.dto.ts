import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CurrentUserDto {
  @ApiProperty({ example: 1, description: 'ID del usuario' })
  @Transform(({value})=> String(value))
  id: string;

  @ApiProperty({ example: 'user@email.com', description: 'Correo del usuario' })
  email: string;

  @ApiProperty({ example: 'admin', description: 'Rol del usuario' })
  role: string;
}