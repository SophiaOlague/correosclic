import { Injectable, NotFoundException } from '@nestjs/common';

import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';

import { CreateProductDto } from '../dto/create-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { CategoryNotFoundException } from 'src/catalog/domain/exceptions/category-not-found.exception';
import { SellerRepository } from 'src/catalog/infrastructure/repositories/seller.repository';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly sellerRepository: SellerRepository,
  ) {}

  
  async create(
  userId: string,
  dto: CreateProductDto,
): Promise<ProductResponseDto> {

  const store =
    await this.sellerRepository.findStoreByUserId(
      userId,
    );

  if (!store) {
    throw new NotFoundException(
      'El vendedor no tiene una tienda registrada.',
    );
  }

  const category =
    await this.categoryRepository.findById(
      dto.categoriaId,
    );

  if (!category) {
    throw new CategoryNotFoundException();
  }

  const product =
    await this.productRepository.create({
      tiendaId: store.id,
      categoriaId: dto.categoriaId,
      codigoPublico: this.generateProductCode(),
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      pesoKg: dto.pesoKg,
    });
    

  return {
  id: product.id,
  codigoPublico: product.codigoPublico,
  nombre: product.nombre,
  descripcion: product.descripcion ?? undefined,
  pesoKg: Number(product.pesoKg),
  activo: product.activo,
  publicado: product.publicado,
  createdAt: product.createdAt,
};
}
private generateProductCode(): string {

  const random = Math.floor(
    100000 + Math.random() * 900000,
  );

  return `CCP-${random}`;
}

}
