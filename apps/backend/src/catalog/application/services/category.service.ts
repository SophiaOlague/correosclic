import { Injectable } from '@nestjs/common';

import { CategoryRepository } from '../../infrastructure/repositories/category.repository';

import { CategorySlugAlreadyExistsException } from '../../domain/exceptions/category-slug-already-exists.exception';

import { CreateCategoryDto } from '../dto/create-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';


@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
  ) {}

  /**
   * Taxonomía de categorías activas.
   *
   * Lectura pública, igual que `GET /catalog/attributes`: es el vocabulario del
   * catálogo y lo necesita cualquiera que vaya a clasificar o filtrar
   * productos. Sin ella, el formulario de alta no tenía de dónde sacar el
   * `categoriaId` que exige `CreateProductDto`.
   */
  async findAll(): Promise<CategoryResponseDto[]> {
    const categories =
      await this.categoryRepository.findAllActive();

    return categories.map((category) => ({
      id: category.id,
      nombre: category.nombre,
      slug: category.slug,
      descripcion: category.descripcion ?? undefined,
      parentId: category.parentId ?? undefined,
      activa: category.activa,
      createdAt: category.createdAt,
    }));
  }

  async create(
    dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const existingCategory =
      await this.categoryRepository.findBySlug(dto.slug);

    if (existingCategory) {
      throw new CategorySlugAlreadyExistsException();
    }

    const category = await this.categoryRepository.create(dto);

return {
  id: category.id,
  nombre: category.nombre,
  slug: category.slug,
  descripcion: category.descripcion ?? undefined,
  parentId: category.parentId ?? undefined,
  activa: category.activa,
  createdAt: category.createdAt,
};
  }
}