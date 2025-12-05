import { PartialType } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class DocumentTypesDto{
    @Expose()
    readonly id: number;

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