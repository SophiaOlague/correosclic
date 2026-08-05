import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ShoppingCartRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}
// obtener el carrito de compras completo por el id del cliente
  async findCompleteCartByCustomerId(clienteId: string) {
    return this.prisma.carrito.findUnique({
      where: {
        clienteId,
      },
      select: {
        id: true,

        items: {
          // Sin orden explícito Postgres devuelve las filas en el orden en que
          // las encuentra, que cambia después de cada UPDATE: la lista del
          // carrito se reordenaba sola al modificar una cantidad.
          orderBy: {
            createdAt: 'asc',
          },

          select: {
            id: true,
            cantidad: true,

            productoVariante: {
              select: {
                id: true,
                sku: true,
                precio: true,

                inventario: {
                  select: {
                    stockDisponible: true,
                  },
                },

                producto: {
                  select: {
                    nombre: true,

                    imagenes: {
                      where: {
                        esPrincipal: true,
                      },
                      select: {
                        url: true,
                      },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  //Buscar un carrito por cliente
  async findByCustomerId(
  clienteId: string,
) {
  return this.prisma.carrito.findUnique({
    where: {
      clienteId,
    },
  });
}
//crear un carrito de compras
async createCart(
  clienteId: string,
) {
  return this.prisma.carrito.create({
    data: {
      clienteId,
    },
  });
}
//buscar un item dentro del carrito
async findItem(
  carritoId: string,
  productoVarianteId: string,
) {
  return this.prisma.carritoItem.findUnique({
    where: {
      carritoId_productoVarianteId: {
        carritoId,
        productoVarianteId,
      },
    },
  });
}
//crear un item dentro del carrito
async createItem(
  data: {
    carritoId: string;
    productoVarianteId: string;
    cantidad: number;
  },
) {
  return this.prisma.carritoItem.create({
    data,
  });
}
//Actualizar cantidad de un item dentro del carrito
async updateItemQuantity(
  itemId: string,
  cantidad: number,
) {
  return this.prisma.carritoItem.update({
    where: {
      id: itemId,
    },
    data: {
      cantidad,
    },
  });
}
//Se usa para agregar productos
async findItemById(itemId: string) {
  return this.prisma.carritoItem.findUnique({
    where: {
      id: itemId,
    },
    include: {
      carrito: true,
    },
  });
}

async deleteItem(
  itemId: string,
): Promise<void> {
  await this.prisma.carritoItem.delete({
    where: {
      id: itemId,
    },
  });
}
//eliminar todos los productos
async deleteItemsByCartId(
  cartId: string,
): Promise<void> {
  await this.prisma.carritoItem.deleteMany({
    where: {
      carritoId: cartId,
    },
  });
}
}

export type CompleteShoppingCart = Awaited<
  ReturnType<
    ShoppingCartRepository['findCompleteCartByCustomerId']
  >
>;
export type ShoppingCartAggregate =
  NonNullable<CompleteShoppingCart>;

