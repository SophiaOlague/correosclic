import { Injectable } from '@nestjs/common';

import { InventoryRepository } from '../../infrastructure/repositories/inventory.repository';

import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { InventoryResponseDto } from '../dto/inventory-response.dto';

import { VariantNotFoundException } from '../../domain/exceptions/variant-not-found.exception';
import { InventoryAlreadyExistsException } from '../../domain/exceptions/inventory-already-exists.exception';

import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { InventoryNotFoundException } from '../../domain/exceptions/inventory-not-found.exception';

import { ReserveInventoryDto } from '../dto/reserve-inventory.dto';
import { InsufficientStockException } from '../../domain/exceptions/insufficient-stock.exception';

import { ReleaseInventoryDto } from '../dto/release-inventory.dto';
import { InsufficientReservedStockException } from '../../domain/exceptions/insufficient-reserved-stock.exception';
import { ConfirmInventoryDto } from '../../application/dto/confirm-inventory.dto';
import { VariantRepository } from '../../infrastructure/repositories/variant.repository';
import { SellerRepository } from '../../infrastructure/repositories/seller.repository';

@Injectable()
export class InventoryService {

  constructor(
    private readonly repository: InventoryRepository,
    private readonly variantRepository: VariantRepository,
    private readonly sellerRepository: SellerRepository,
  ) {}

  /**
   * El inventario de una variante solo lo toca el vendedor dueño del producto.
   *
   * Sin esta comprobación, `variantId` viajaba en la URL sin validar: cualquier
   * usuario autenticado podía dejar en cero el stock de cualquier vendedor.
   * Responde 404 y no 403, igual que el resto del catálogo.
   */
  private async assertVariantOwnership(
    userId: string,
    variantId: string,
  ): Promise<void> {

    const store =
      await this.sellerRepository.findStoreByUserId(
        userId,
      );

    if (!store) {
      throw new VariantNotFoundException();
    }

    const variant =
      await this.variantRepository.findByIdWithStore(
        variantId,
      );

    if (
      !variant ||
      variant.producto.tiendaId !== store.id
    ) {
      throw new VariantNotFoundException();
    }
  }

  async create(
    userId: string,
    variantId: string,
    dto: CreateInventoryDto,
  ): Promise<InventoryResponseDto> {

    // Paso 1
    await this.assertVariantOwnership(
      userId,
      variantId,
    );

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
//Actualizar inventario
async update(
  userId: string,
  variantId: string,
  dto: UpdateInventoryDto,
): Promise<InventoryResponseDto> {

  await this.assertVariantOwnership(
    userId,
    variantId,
  );

  const inventory =
    await this.repository.findInventoryByVariantId(
      variantId,
    );

  if (!inventory) {
    throw new InventoryNotFoundException();
  }

  const updated =
    await this.repository.update(
      inventory.id,
      {
        stockDisponible:
          dto.stockDisponible,

        stockMinimo:
          dto.stockMinimo,
      },
    );

  return {

    id: updated.id,

    productoVarianteId:
      updated.productoVarianteId,

    stockDisponible:
      updated.stockDisponible,

    stockReservado:
      updated.stockReservado,

    stockMinimo:
      updated.stockMinimo,

    createdAt:
      updated.createdAt,

  };

}
//reserve inventory
async reserve(
  variantId: string,
  dto: ReserveInventoryDto,
): Promise<InventoryResponseDto> {

  // Paso 1
  const inventory =
    await this.repository.findInventoryByVariantId(
      variantId,
    );

  if (!inventory) {
    throw new InventoryNotFoundException();
  }

  // Paso 2
  if (
    inventory.stockDisponible <
    dto.cantidad
  ) {
    throw new InsufficientStockException();
  }

  // Paso 3
  const updated =
    await this.repository.reserve(
      inventory.id,
      dto.cantidad,
    );

  const response: InventoryResponseDto = {

    id: updated.id,

    productoVarianteId:
      updated.productoVarianteId,

    stockDisponible:
      updated.stockDisponible,

    stockReservado:
      updated.stockReservado,

    stockMinimo:
      updated.stockMinimo,

    createdAt:
      updated.createdAt,

  };

  return response;

}
//release inventory
async release(
  variantId: string,
  dto: ReleaseInventoryDto,
): Promise<InventoryResponseDto> {

  // Paso 1
  const inventory =
    await this.repository.findInventoryByVariantId(
      variantId,
    );

  if (!inventory) {
    throw new InventoryNotFoundException();
  }

  // Paso 2
  if (
    inventory.stockReservado <
    dto.cantidad
  ) {
    throw new InsufficientReservedStockException();
  }

  // Paso 3
  const updated =
    await this.repository.release(
      inventory.id,
      dto.cantidad,
    );

  return {

    id: updated.id,

    productoVarianteId:
      updated.productoVarianteId,

    stockDisponible:
      updated.stockDisponible,

    stockReservado:
      updated.stockReservado,

    stockMinimo:
      updated.stockMinimo,

    createdAt:
      updated.createdAt,

  };

}
//confirm inventory
async confirm(
  variantId: string,
  dto: ConfirmInventoryDto,
): Promise<InventoryResponseDto> {

  const inventory =
    await this.repository.findInventoryByVariantId(
      variantId,
    );

  if (!inventory) {
    throw new InventoryNotFoundException();
  }

  if (
    inventory.stockReservado <
    dto.cantidad
  ) {
    throw new InsufficientReservedStockException();
  }

  const updated =
    await this.repository.confirm(
      inventory.id,
      dto.cantidad,
    );

  return {

    id: updated.id,

    productoVarianteId:
      updated.productoVarianteId,

    stockDisponible:
      updated.stockDisponible,

    stockReservado:
      updated.stockReservado,

    stockMinimo:
      updated.stockMinimo,

    createdAt:
      updated.createdAt,

  };

}
}