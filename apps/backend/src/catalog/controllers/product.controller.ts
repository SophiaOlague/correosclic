import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';

import { ProductService } from '../application/services/product.service';

import { CreateProductDto } from '../application/dto/create-product.dto';

@Controller('seller/products')
export class ProductController {

  constructor(
    private readonly productService: ProductService,
  ) {}

  @UseGuards(JwtAuthGuard)
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

}