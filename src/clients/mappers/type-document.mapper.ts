import { DocumentTypesDto } from "../dtos/clients.dto";
import { TypeDocumentRawInterface } from "../interfaces/type-document-raw.interface";

export class TypeDocumentMapper{
    static rawToDto(typeDoc: TypeDocumentRawInterface){
        return {
            id: typeDoc.id,
            description: typeDoc.description
        }
    }

    static rawToDtoList(rows: DocumentTypesDto[]): DocumentTypesDto[] {
        return rows.map((raw) => this.rawToDto(raw));
    }
}
