import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Product, ProductSchema } from "./schemas/product.schema";
import { ProductType, ProductTypeSchema } from "./schemas/product-type.schema";
import { ProductTypeRepository } from "./repositories/product-type.repository";
import { ProductsController } from "./products.controller";
import { ProductsRepository } from "./repositories/products.repository";
import { ProductsService } from "./products.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Product.name, schema: ProductSchema },
            { name: ProductType.name, schema: ProductTypeSchema }
        ])
    ],
    controllers: [ProductsController],
    providers: [
        ProductsService,
        ProductsRepository,
        ProductTypeRepository,
        {
            provide: 'IProductRepository',
            useClass: ProductsRepository
        },
        {
            provide: 'IProductTypeRepository',
            useClass: ProductTypeRepository
        }
    ],
    exports: [ProductsService, MongooseModule]
})
export class ProductsModule {}
