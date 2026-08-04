import { Body, Controller, Get, Post } from '@nestjs/common';

import { CategoryService } from '../application/services/category.service';
import { CreateCategoryDto } from '../application/dto/create-category.dto';

@Controller('catalog/categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  /** Lectura pública, como el resto de la taxonomía del catálogo. */
  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  @Post()
async create(
  @Body() dto: CreateCategoryDto,
) {
  return this.categoryService.create(dto);
}
}