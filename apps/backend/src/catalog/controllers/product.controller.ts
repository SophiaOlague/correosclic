import {
  Body,
  Controller,
  Post,
  UseGuards,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
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

import { UpdateInventoryDto } from '../application/dto/update-inventory.dto';
import { ReserveInventoryDto } from '../application/dto/reserve-inventory.dto';
import { ReleaseInventoryDto } from '../application/dto/release-inventory.dto';
import { ConfirmInventoryDto } from '../application/dto/confirm-inventory.dto';
import { ProductImageService } from '../product-image/services/product-image.service';

import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';


@Controller('seller/products')
@UseGuards(JwtAuthGuard)
export class ProductController {

  constructor(
    private readonly productService: ProductService,
    private readonly variantService: VariantService,
    private readonly inventoryService: InventoryService,
    private readonly productImageService: ProductImageService,
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
//actualizar inventario endpoint
@Patch('variants/:id/inventory')
updateInventory(

  @Param('id')
  variantId: string,

  @Body()
  dto: UpdateInventoryDto,

) {

  return this.inventoryService.update(
    variantId,
    dto,
  );

}
//reserve inventory endpoint
@Post('variants/:id/inventory/reserve')
reserveInventory(

  @Param('id')
  variantId: string,

  @Body()
  dto: ReserveInventoryDto,

) {

  return this.inventoryService.reserve(
    variantId,
    dto,
  );

}
//release inventory endpoint
@Post('variants/:id/inventory/release')
releaseInventory(

  @Param('id')
  variantId: string,

  @Body()
  dto: ReleaseInventoryDto,

) {

  return this.inventoryService.release(
    variantId,
    dto,
  );

}
//confirm inventory endpoint
@Post('variants/:id/inventory/confirm')
confirmInventory(

  @Param('id')
  variantId: string,

  @Body()
  dto: ConfirmInventoryDto,

) {

  return this.inventoryService.confirm(
    variantId,
    dto,
  );

}
//upload product image endpoint
@Post(':productId/images')
@UseInterceptors(FileInterceptor('file'))
async uploadProductImage(

  @CurrentUser()
  user: AuthenticatedUserDto,

  @Param('productId')
  productId: string,

  @UploadedFile(

  new ParseFilePipe({

    validators: [

      new MaxFileSizeValidator({

        maxSize: 5 * 1024 * 1024,

      }),

      new FileTypeValidator({

        fileType: /^image\/(jpeg|png|webp)$/,

      }),

    ],

    fileIsRequired: true,

  }),

)

file: Express.Multer.File,

) {


  return this.productImageService.uploadProductImage(

    user.id,

    productId,

    {
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    },

  );

}
}