import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ROLES } from '../../auth/constants/roles.constants';

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

  /**
   * Alta de categoría.
   *
   * Antes **no tenía ningún guard**: respondía 201 a una petición anónima, así
   * que cualquiera podía escribir en la taxonomía del catálogo. La lectura
   * sigue siendo pública; la escritura es del administrador.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  async create(
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoryService.create(dto);
  }
}
