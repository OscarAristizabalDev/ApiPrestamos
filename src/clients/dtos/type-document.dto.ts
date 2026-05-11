import { PartialType } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Types } from "mongoose";

export class DocumentTypesDto{
    @Expose()
    readonly id: string | Types.ObjectId | unknown;

    @Expose()
    readonly description: string;
}

export class CreateTypeDocumentDto{
    @IsNotEmpty()
    @IsString()
    readonly description: string;

    @IsNotEmpty()
    @IsNumber()
    readonly active: number;
}

export class UpdateTypeDocumentDto extends PartialType(CreateTypeDocumentDto){    
}