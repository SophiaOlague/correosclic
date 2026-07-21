import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class InventoryRepository {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /*async findVariantById(
    variantId: string,
  ) {
    return this.prisma.productoVariante.findUnique({
      where: {
        id: variantId,
      },
    });
  }**/

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
//Actualizar inventario
async update(
  inventoryId: string,
  data: {
    stockDisponible: number;
    stockMinimo: number;
  },
) {
  return this.prisma.inventario.update({
    where: {
      id: inventoryId,
    },
    data: {
      stockDisponible: data.stockDisponible,
      stockMinimo: data.stockMinimo,
    },
  });
}
//reserve inventory
async reserve(
  inventoryId: string,
  quantity: number,
) {

  return this.prisma.inventario.update({

    where: {
      id: inventoryId,
    },

    data: {

      stockDisponible: {
        decrement: quantity,
      },

      stockReservado: {
        increment: quantity,
      },

    },

  });

}
//release inventory
async release(
  inventoryId: string,
  quantity: number,
) {

  return this.prisma.inventario.update({

    where: {
      id: inventoryId,
    },

    data: {

      stockDisponible: {
        increment: quantity,
      },

      stockReservado: {
        decrement: quantity,
      },

    },

  });

}
//confirm shipping
async confirm(
  inventoryId: string,
  quantity: number,
) {

  return this.prisma.inventario.update({

    where: {
      id: inventoryId,
    },

    data: {

      stockReservado: {
        decrement: quantity,
      },

    },

  });

}
}