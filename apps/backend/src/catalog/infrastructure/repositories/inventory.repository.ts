import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class InventoryRepository {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findVariantById(
    variantId: string,
  ) {
    return this.prisma.productoVariante.findUnique({
      where: {
        id: variantId,
      },
    });
  }

  async findInventoryByVariantId(
    variantId: string,
  ) {
    return this.prisma.inventario.findUnique({
      where: {
        productoVarianteId: variantId,
      },
    });
  }

  async create(
    data: {
      productoVarianteId: string;
      stockDisponible: number;
      stockMinimo: number;
    },
  ) {
    return this.prisma.inventario.create({
      data: {
        productoVarianteId: data.productoVarianteId,
        stockDisponible: data.stockDisponible,
        stockMinimo: data.stockMinimo,
      },
    });
  }

}