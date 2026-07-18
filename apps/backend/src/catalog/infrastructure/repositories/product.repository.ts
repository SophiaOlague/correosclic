import { Injectable } from '@nestjs/common';

import {
  Producto,
} from '@correosclic/database';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProductRepository {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    data: {
      tiendaId: string;
      categoriaId: string;
      codigoPublico: string;
      nombre: string;
      descripcion?: string;
      pesoKg: number;
    },
  ): Promise<Producto> {

    return this.prisma.producto.create({

      data: {

        tiendaId: data.tiendaId,

        categoriaId: data.categoriaId,

        codigoPublico: data.codigoPublico,

        nombre: data.nombre,

        descripcion: data.descripcion,

        pesoKg: data.pesoKg,

      },

    });

  }

  async findById(
    id: string,
  ): Promise<Producto | null> {

    return this.prisma.producto.findUnique({

      where: {
        id,
      },

    });

  }

  async findByCodigoPublico(
    codigoPublico: string,
  ): Promise<Producto | null> {

    return this.prisma.producto.findUnique({

      where: {
        codigoPublico,
      },

    });

  }

  async findByIdAndStoreId(
    productoId: string,
    tiendaId: string,
  ): Promise<Producto | null> {

    return this.prisma.producto.findFirst({

      where: {

        id: productoId,

        tiendaId,

      },

    });

  }

}