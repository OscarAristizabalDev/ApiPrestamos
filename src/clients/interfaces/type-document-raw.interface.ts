import { TypeDocumentDoc } from "../schemas/type-document-schema";

export interface TypeDocumentRawInterface{
    id: number;
    description: string;
    active?: number;
}

export interface ITypeDocumentRepository{
    findAll(): Promise<TypeDocumentDoc[]>;
}