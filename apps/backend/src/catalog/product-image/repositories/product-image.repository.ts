import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { ProductoImagen } from '@correosclic/database';

@Injectable()
export class ProductImageRepository {

  constructor(
    private readonly prisma: PrismaService,
  ) {}
//count images
async countByProductId(
  productoId: string,
): Promise<number> {

  return this.prisma.productoImagen.count({

    where: {
      productoId,
    },

  });

}
//obtener el ultimo orden de imagenes de un producto
async getLastOrder(
  productoId: string,
): Promise<number> {

  const image =
    await this.prisma.productoImagen.findFirst({

      where: {
        productoId,
      },

      orderBy: {
        orden: 'desc',
      },

      select: {
        orden: true,
      },

    });

  return image?.orden ?? 0;

}
//crear imagen de producto
async create(
  data: {
    productoId: string;
    storageKey: string;
    url: string;
    orden: number;
    esPrincipal: boolean;
  },
): Promise<ProductoImagen> {

  return this.prisma.productoImagen.create({

    data: {

      productoId: data.productoId,

      storageKey: data.storageKey,

      url: data.url,

      orden: data.orden,

      esPrincipal: data.esPrincipal,

    },

  });

}
//encontrar imagen de producto por id
async findPrincipalByProductId(
  productoId: string,
): Promise<ProductoImagen | null> {

  return this.prisma.productoImagen.findFirst({

    where: {

      productoId,

      esPrincipal: true,

    },

  });

}
}