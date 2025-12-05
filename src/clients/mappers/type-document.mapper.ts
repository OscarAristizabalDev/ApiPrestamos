import { TypeDocumentRawInterface } from "../interfaces/type-document-raw.interface";
import { TypeDocumentDoc } from "../schemas/type-document-schema";

export class TypeDocumentMapper{
    static rawToDto(typeDoc: TypeDocumentDoc): TypeDocumentRawInterface{
        return {
            id: typeDoc.id,
            description: typeDoc.description
        }
    }
}
