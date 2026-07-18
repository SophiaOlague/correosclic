import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AttributeRepository {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findByName(
    nombre: string,
  ) {
    return this.prisma.atributo.findUnique({
      where: {
        nombre,
      },
    });
  }

  async create(
    nombre: string,
  ) {
    return this.prisma.atributo.create({
      data: {
        nombre,
      },
    });
  }

  async findValue(
  atributoId: string,
  valor: string,
) {
  return this.prisma.valorAtributo.findFirst({
    where: {
      atributoId,
      valor,
    },
  });
}

async createValue(
  atributoId: string,
  valor: string,
) {
  return this.prisma.valorAtributo.create({
    data: {
      atributoId,
      valor,
    },
  });
}

async findAll() {
  return this.prisma.atributo.findMany({
    orderBy: {
      nombre: 'asc',
    },
  });
}

async findValuesByAttributeId(
  attributeId: string,
) {
  return this.prisma.valorAtributo.findMany({
    where: {
      atributoId: attributeId,
    },
    orderBy: {
      valor: 'asc',
    },
  });
}
}