import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../storage/application/services/storage.service';

import { ProductImageMapper } from '../mappers/product-image.mapper';
import { ProductImageRepository } from '../repositories/product-image.repository';

import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { SellerRepository } from '../../infrastructure/repositories/seller.repository';
import { StoreNotFoundException } from '../../domain/exceptions/store-not-found.exception';
import { ProductNotFoundException } from '../../domain/exceptions/product-not-found.exception';
import { ProductImageLimitException } from '../../domain/exceptions/product-image-limit.exception';
import { ProductImageDto } from '../dto/product-image.dto';
@Injectable()
export class ProductImageService {

  constructor(

    private readonly sellerRepository: SellerRepository,

    private readonly productRepository: ProductRepository,

    private readonly productImageRepository: ProductImageRepository,

    private readonly storageService: StorageService,

    private readonly productImageMapper: ProductImageMapper,

  ) {}

  async uploadProductImage(
  userId: string,
  productId: string,
  file: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
  },
): Promise<ProductImageDto> {

    const store = await this.sellerRepository.findStoreByUserId(userId);
    
    if (!store) {
      throw new StoreNotFoundException();
}

const product = await this.productRepository.findByIdAndStoreId(
  productId,
  store.id,
);
if (!product) {
  throw new ProductNotFoundException();
}

const totalImages = await this.productImageRepository.countByProductId(
  product.id,
);
if (totalImages >= 10) {
  throw new ProductImageLimitException();
}

const uploadedFile = await this.storageService.upload(file);

const lastOrder =
  await this.productImageRepository.getLastOrder(product.id);

const order = lastOrder + 1;

const isPrincipal = totalImages === 0;

const productImage =
  await this.productImageRepository.create({

    productoId: product.id,

    storageKey: uploadedFile.key,

    url: uploadedFile.url,

    orden: order,

    esPrincipal: isPrincipal,

  });
  return this.productImageMapper.toDto(productImage);
}

}