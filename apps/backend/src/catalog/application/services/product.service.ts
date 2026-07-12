import { Injectable, NotFoundException } from '@nestjs/common';

import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';

import { CreateProductDto } from '../dto/create-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { CategoryNotFoundException } from 'src/catalog/domain/exceptions/category-not-found.exception';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async create(
    dto: CreateProductDto,
  ): Promise<ProductResponseDto> {

    const category =
      await this.categoryRepository.findById(dto.categoriaId);

    if (!category) {
      throw new CategoryNotFoundException();
    }

    throw new Error('Pendiente de implementar');
  }
}