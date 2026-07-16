import { Injectable } from '@nestjs/common';

import { InventoryRepository } from '../../infrastructure/repositories/inventory.repository';

import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { InventoryResponseDto } from '../dto/inventory-response.dto';

import { VariantNotFoundException } from '../../domain/exceptions/variant-not-found.exception';
import { InventoryAlreadyExistsException } from '../../domain/exceptions/inventory-already-exists.exception';

@Injectable()
export class InventoryService {

  constructor(
    private readonly repository: InventoryRepository,
  ) {}

  async create(
    variantId: string,
    dto: CreateInventoryDto,
  ): Promise<InventoryResponseDto> {

    // Paso 1
    const variant =
      await this.repository.findVariantById(
        variantId,
      );

    if (!variant) {
      throw new VariantNotFoundException();
    }

    // Paso 2
    const inventory =
      await this.repository.findInventoryByVariantId(
        variantId,
      );

    if (inventory) {
      throw new InventoryAlreadyExistsException();
    }

    // Paso 3
    const created =
      await this.repository.create({

        productoVarianteId: variantId,

        stockDisponible:
          dto.stockDisponible,

        stockMinimo:
          dto.stockMinimo,

      });

    return {

      id: created.id,

      productoVarianteId:
        created.productoVarianteId,

      stockDisponible:
        created.stockDisponible,

      stockReservado:
        created.stockReservado,

      stockMinimo:
        created.stockMinimo,

      createdAt:
        created.createdAt,

    };

  }

}