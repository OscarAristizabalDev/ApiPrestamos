import { ProductTypeDto } from "../dtos/product-type.dto";
import { ProductTypeRawInterface } from "../interfaces/product-type-raw.interface";
import { ProductTypeDoc } from "../schemas/product-type.schema";

export class ProductTypeMapper {
    static rawToDto(type: ProductTypeDoc): ProductTypeRawInterface {
        return {
            id: type._id.toString(),
            name: type.name,
            code: type.code,
            notes: type.notes,
            active: type.active
        };
    }

    static toDto(type: ProductTypeDoc | { _id?: unknown; id?: unknown; name: string; code: string; notes?: string }): ProductTypeDto {
        const id = typeof (type as ProductTypeDoc)._id !== 'undefined'
            ? (type as ProductTypeDoc)._id
            : (type as { id?: unknown }).id;

        return {
            id,
            name: type.name,
            code: type.code,
            notes: type.notes
        };
    }
}
