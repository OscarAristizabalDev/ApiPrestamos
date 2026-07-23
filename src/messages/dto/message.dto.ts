import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  to: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  content: string;
}
