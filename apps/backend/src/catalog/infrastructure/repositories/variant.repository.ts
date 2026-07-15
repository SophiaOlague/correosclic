import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class VariantRepository {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findProductById(
    productId: string,
  ) {
    return this.prisma.producto.findUnique({
      where: {
        id: productId,
      },
    });
  }

  async findVariantBySku(
    sku: string,
  ) {
    return this.prisma.productoVariante.findUnique({
      where: {
        sku,
      },
    });
  }

}