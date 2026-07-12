import { Injectable } from '@nestjs/common';

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
  ) {
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

  async findByCodigoPublico(
    codigoPublico: string,
  ) {
    return this.prisma.producto.findUnique({
      where: {
        codigoPublico,
      },
    });
  }
}