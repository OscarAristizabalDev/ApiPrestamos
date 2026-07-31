import { IsMongoId, IsNumber, IsString } from "class-validator";


export class ProductSnapshotDto {

    @IsMongoId()
    id: string;

    @IsString()
    code: string;

    @IsString()
    name: string;

    @IsString()
    brand: string;

    @IsString()
    model: string;

    @IsString()
    description: string;

    @IsNumber()
    salePrice: number;

    @IsString()
    imageUrl: string;
}