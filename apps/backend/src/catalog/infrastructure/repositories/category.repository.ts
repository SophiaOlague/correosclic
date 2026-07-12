import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

 async create(
  data: {
    nombre: string;
    slug: string;
    descripcion?: string;
    parentId?: string;
  },
) {
  return this.prisma.categoria.create({
    data: {
      nombre: data.nombre,
      slug: data.slug,
      descripcion: data.descripcion,
      parentId: data.parentId,
    },
  });
}

async findBySlug(
  slug: string,
) {
  return this.prisma.categoria.findUnique({
    where: {
      slug,
    },
  });
}

async findById(
  id: string,
) {
  return this.prisma.categoria.findUnique({
    where: {
      id,
    },
  });
}
}
