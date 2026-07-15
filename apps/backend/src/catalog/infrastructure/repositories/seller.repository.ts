import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SellerRepository {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findStoreByUserId(
    userId: string,
  ) {
    return this.prisma.tienda.findFirst({
      where: {
        vendedor: {
          usuarioId: userId,
        },
      },
    });
  }

}