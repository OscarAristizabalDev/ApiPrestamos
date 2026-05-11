import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import {
    CreateProductTypeDto,
    FindOneProductTypeDto,
    UpdateProductTypeDto,
    UpdateProductTypeStatusDto
} from "./dtos/product-type.dto";
import { CreateProductsDto, FindOneProductDto, UpdateProductsDto } from "./dtos/products.dto";
import { ROLEACCESS } from "src/clients/interfaces/client-repository.interface";
import { ProductMapper, RowFoundProductMapper } from "./mappers/products.mapper";
import { ProductsService } from "./products.service";

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get('types')
    async getProductTypes() {
        return await this.productsService.getProductTypes();
    }

    @Get('types/find')
    async getProductTypeByItem(@Query() filters: FindOneProductTypeDto) {
        return await this.productsService.getProductTypeByItem(filters);
    }

    @Get('types/:id')
    async getProductTypeById(@Param('id') id: string) {
        return await this.productsService.getProductTypeByItem({ id });
    }

    @Post('types')
    @Roles(ROLEACCESS.MIDACCESS)
    async createProductType(@Body() data: CreateProductTypeDto) {
        return await this.productsService.createProductType(data);
    }

    @Put('types')
    @Roles(ROLEACCESS.MIDACCESS)
    async updateProductType(@Body() data: UpdateProductTypeDto) {

        return await this.productsService.updateProductType(data);
    }

    @Delete('types/:id')
    @Roles(ROLEACCESS.MIDACCESS)
    async deleteProductType(@Param('id') id: string) {
        return await this.productsService.deleteProductType(id);
    }

    @Put('types/:id/status')
    @Roles(ROLEACCESS.MIDACCESS)
    async updateProductTypeStatus(@Param('id') id: string, @Body() data: UpdateProductTypeStatusDto) {

        return await this.productsService.updateProductTypeStatus(id, data.active);
    }

    @Get('find')
    async getProductByItem(@Query() filters: FindOneProductDto) {
        const product = await this.productsService.getProductByItem(filters);
        return RowFoundProductMapper.toDto(product);
    }

    @Get('all')
    @Roles(ROLEACCESS.MIDACCESS)
    async getAllProducts(
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('search') search?: string,
        @Query('productType') productType?: string
    ) {
        return await this.productsService.getAllProductsPaginated({
            page: parseInt(page),
            limit: parseInt(limit),
            inputSearch: search,
            productType
        });
    }

    @Post()
    async createProduct(@Body() productDto: CreateProductsDto) {
        const product = await this.productsService.createProduct(productDto);
        return ProductMapper.toDto(product);
    }

    @Put()
    async updateProduct(@Body() data: UpdateProductsDto) {
        const productUpdated = await this.productsService.updateProduct(data.id, data);
        return ProductMapper.toDto(productUpdated);
    }

    @Delete(':id')
    async deleteProduct(@Param('id') id: string) {
        return await this.productsService.deleteProduct(id);
    }
}
