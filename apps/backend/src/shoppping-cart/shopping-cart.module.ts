import { Injectable, Module } from '@nestjs/common';
import { ShoppingCartRepository } from './infrastructure/repositories/shopping-cart.repository';
import { ShoppingCartService } from './application/services/shopping-cart.service';
import { ShoppingCartController } from './controllers/shopping-cart.controller';
import { ShoppingCartMapper } from './application/mappers/shopping-cart.mapper';
import { CatalogModule } from '../catalog/catalog.module';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports: [CatalogModule,AuthModule],
  controllers: [
    ShoppingCartController,
  ],
  providers: [
    ShoppingCartService,
    ShoppingCartRepository,
    ShoppingCartMapper,
  ],
})
export class ShoppingCartModule {}