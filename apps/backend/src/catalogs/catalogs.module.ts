import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AttributeController } from './controllers/attribute.controller';
import { AttributeRepository } from './infrastructure/repositories/attribute.repository';  
import { AttributeService } from './application/services/attribute.service';
import { CatalogAttributeController } from './controllers/catalog-attribute.controller';

@Module({
  imports: [
    PrismaModule,
  ],

  controllers: [
    AttributeController,
    CatalogAttributeController,
  ],

  providers: [
    AttributeRepository,
    AttributeService,
  ],

  exports: [
    AttributeRepository,
    AttributeService,
  ],
})
export class CatalogsModule {}