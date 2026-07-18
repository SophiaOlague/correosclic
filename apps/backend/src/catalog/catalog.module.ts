import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

import { CategoryService } from './application/services/category.service';
import { ProductService } from './application/services/product.service';
import { VariantService } from './application/services/variant.service';
import { InventoryService } from './application/services/inventory.service';
import { CategoryRepository } from './infrastructure/repositories/category.repository';

import { CategoryController } from './controllers/category.controller';
import { ProductRepository } from './infrastructure/repositories/product.repository';
import { ProductController } from './controllers/product.controller';
import { SellerRepository } from './infrastructure/repositories/seller.repository';
import { VariantRepository } from './infrastructure/repositories/variant.repository';
import { InventoryRepository } from './infrastructure/repositories/inventory.repository';
import { ProductImageController } from './product-image/controllers/product-image.controller';
import { ProductImageService } from './product-image/services/product-image.service';
import { ProductImageMapper } from './product-image/mappers/product-image.mapper';
import { ProductImageRepository } from './product-image/repositories/product-image.repository';
import { StorageModule } from '../storage/storage.module';


@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [CategoryController, ProductController,ProductImageController],
  
  providers: [
    CategoryService,
    ProductService,
    VariantService,
    InventoryService,
    ProductImageService,
    CategoryRepository,
    ProductRepository,
    SellerRepository,
    VariantRepository,
    InventoryRepository,
    ProductImageRepository,
    ProductImageMapper,
  ],
  exports: [
    CategoryService,
    ProductService,
    VariantService,
    InventoryService,
  ],
})
export class CatalogModule {}