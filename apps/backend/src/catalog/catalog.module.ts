import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

import { CategoryService } from './application/services/category.service';
import { ProductService } from './application/services/product.service';
import { VariantService } from './application/services/variant.service';
import { InventoryService } from './application/services/inventory.service';
import { CategoryRepository } from './infrastructure/repositories/category.repository';

import { CategoryController } from './controllers/category.controller';


@Module({
  imports: [PrismaModule],
  controllers: [CategoryController
  ],
  providers: [
    CategoryService,
    ProductService,
    VariantService,
    InventoryService,
    CategoryRepository,
  ],
  exports: [
    CategoryService,
    ProductService,
    VariantService,
    InventoryService,
  ],
})
export class CatalogModule {}