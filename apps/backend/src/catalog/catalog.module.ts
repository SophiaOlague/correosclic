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


@Module({
  imports: [PrismaModule],
  controllers: [CategoryController, ProductController],
  
  providers: [
    CategoryService,
    ProductService,
    VariantService,
    InventoryService,
    CategoryRepository,
    ProductRepository,
    SellerRepository,
    VariantRepository,
    InventoryRepository,
  ],
  exports: [
    CategoryService,
    ProductService,
    VariantService,
    InventoryService,
  ],
})
export class CatalogModule {}