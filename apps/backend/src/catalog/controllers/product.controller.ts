import {
  Body,
  Controller,
  Post,
  UseGuards,
  Param,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';

import { ProductService } from '../application/services/product.service';

import { CreateProductDto } from '../application/dto/create-product.dto';
import { VariantService } from '../application/services/variant.service';
import { CreateProductVariantDto } from '../application/dto/create-product-variant.dto';

import { InventoryService } from '../application/services/inventory.service';
import { CreateInventoryDto } from '../application/dto/create-inventory.dto';

@Controller('seller/products')
@UseGuards(JwtAuthGuard)
export class ProductController {

  constructor(
    private readonly productService: ProductService,
    private readonly variantService: VariantService,
    private readonly inventoryService: InventoryService,
  ) {}

  
  @Post()
  create(
    @CurrentUser()
    user: AuthenticatedUserDto,

    @Body()
    dto: CreateProductDto,
  ) {
    return this.productService.create(
      user.id,
      dto,
    );
  }

  //variant creation endpoint

  @Post(':id/variants')
  createVariant(
    @CurrentUser()
    user: AuthenticatedUserDto,

    @Param('id')
    productId: string,

    @Body()
    dto: CreateProductVariantDto,
  ) {

    return this.variantService.create(
      user.id,
      productId,
      dto,
    );

}
//inventory creation endpoint
@Post('variants/:id/inventory')
createInventory(

  @Param('id')
  variantId: string,

  @Body()
  dto: CreateInventoryDto,

) {

  return this.inventoryService.create(
    variantId,
    dto,
  );

}
}