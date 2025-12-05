import { Injectable, NotFoundException, Scope } from "@nestjs/common";
import { Client } from '../schemas/client.schema';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { ITypeDocumentRepository, TypeDocumentRawInterface } from '../interfaces/type-document-raw.interface';
import { TypeDocument, TypeDocumentDoc } from "../schemas/type-document-schema";


@Injectable({ scope: Scope.REQUEST })
export class TypeDocumentRepository implements ITypeDocumentRepository{
    private defaultLimit: number;
    constructor(
        private readonly configService: ConfigService,
        @InjectModel(TypeDocument.name) private typeDocumentModel: Model<TypeDocumentDoc>
    ) {
        this.defaultLimit = +this.configService.get<number>('PAGINATION_LIMIT', 10);
    }

    async findAll(): Promise<TypeDocumentDoc[]> {        
        return await this.typeDocumentModel.find({}).exec();
    }
}