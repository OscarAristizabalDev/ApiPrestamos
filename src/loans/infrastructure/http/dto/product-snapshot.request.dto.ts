import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductSnapshotRequestDto {
    @IsOptional()
    @IsString()
    readonly id?: string;

    @IsString()
    readonly code: string;

    @IsString()
    readonly name: string;

    @IsOptional()
    @IsString()
    readonly brand?: string;

    @IsOptional()
    @IsString()
    readonly model?: string;

    @IsOptional()
    @IsString()
    readonly description?: string;

    @IsNumber()
    readonly salePrice: number;

    @IsOptional()
    @IsString()
    readonly imageUrl?: string;
}
