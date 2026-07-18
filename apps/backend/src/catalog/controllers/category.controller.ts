import { Body, Controller, Post } from '@nestjs/common';

import { CategoryService } from '../application/services/category.service';
import { CreateCategoryDto } from '../application/dto/create-category.dto';

@Controller('catalog/categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  @Post()
async create(
  @Body() dto: CreateCategoryDto,
) {
  return this.categoryService.create(dto);
}
}