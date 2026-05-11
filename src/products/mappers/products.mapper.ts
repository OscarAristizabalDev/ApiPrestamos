import { FoundProductDto, ResponseProductDto } from "../dtos/products.dto";
import { ProductTypeMapper } from "./product-type.mapper";
import { ProductDocument } from "../schemas/product.schema";

export class ProductMapper {
    static toDto(product: ProductDocument): ResponseProductDto {
        return {
            id: product._id,
            name: product.name,
            code: product.code,
            salePrice: product.salePrice,
            stock: product.stock
        };
    }
}

export class RowFoundProductMapper {
    static toDto(product: ProductDocument): FoundProductDto {
        const productTypeRaw = product.productType as any;

        return {
            id: product._id,
            name: product.name,
            salePrice: product.salePrice,
            stock: product.stock,
            code: product.code,
            costPrice: product.costPrice,
            barcode: product.barcode,
            description: product.description,
            brand: product.brand,
            model: product.model,
            imageUrls: product.imageUrls,
            productType: ProductTypeMapper.toDto(productTypeRaw)
        };
    }
}
