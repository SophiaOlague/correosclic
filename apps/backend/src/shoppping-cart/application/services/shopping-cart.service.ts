import { Injectable } from '@nestjs/common';

import { ShoppingCartDto } from '../dto/shopping-cart.dto';
import { ShoppingCartMapper } from '../mappers/shopping-cart.mapper';

import { ShoppingCartRepository } from '../../infrastructure/repositories/shopping-cart.repository';
import { VariantRepository } from '../../../catalog/infrastructure/repositories/variant.repository';

import { AddShoppingCartItemDto } from '../dto/add-shopping-cart-item.dto';
import { UpdateShoppingCartItemDto } from '../dto/update-shopping-cart-item.dto';

import { InvalidQuantityException } from '../../domain/exceptions/invalid-quantity.exception';
import { InsufficientStockException } from '../../domain/exceptions/insufficient-stock.exception';
import { CustomerNotFoundException } from '../../domain/exceptions/customer-not-found.exception';

import { VariantNotFoundException } from '../../../catalog/domain/exceptions/variant-not-found.exception';

import { UserRepository } from '../../../auth/infrastructure/repositories/user.repository';

import { CartItemAccessDeniedException } from '../../domain/exceptions/cart-item-access-denied.exception';
import { CartItemNotFoundException } from '../../domain/exceptions/cart-item-not-found.exception';

@Injectable()
export class ShoppingCartService {
  constructor(
    private readonly shoppingCartRepository: ShoppingCartRepository,
    private readonly shoppingCartMapper: ShoppingCartMapper,
    private readonly variantRepository: VariantRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async getCart(
    userId: string,
  ): Promise<ShoppingCartDto> {
    const client =
      await this.getClientByUserId(userId);

    const cart =
      await this.shoppingCartRepository.findCompleteCartByCustomerId(
        client.id,
      );

    return this.shoppingCartMapper.toDto(cart);
  }

  async addItem(
    userId: string,
    dto: AddShoppingCartItemDto,
  ): Promise<ShoppingCartDto> {
    const client =
      await this.getClientByUserId(userId);

    if (dto.cantidad <= 0) {
      throw new InvalidQuantityException();
    }

    const variant = await this.getValidVariant(
      dto.productoVarianteId,
      dto.cantidad,
    );

    let cart =
      await this.shoppingCartRepository.findByCustomerId(
        client.id,
      );

    if (!cart) {
      cart =
        await this.shoppingCartRepository.createCart(
          client.id,
        );
    }

    const item =
      await this.shoppingCartRepository.findItem(
        cart.id,
        dto.productoVarianteId,
      );

    if (item) {
      const nuevaCantidad =
        item.cantidad + dto.cantidad;

      const inventory = variant.inventario!;

      if (
        nuevaCantidad >
        inventory.stockDisponible
      ) {
        throw new InsufficientStockException(
          inventory.stockDisponible,
        );
      }

      await this.shoppingCartRepository.updateItemQuantity(
        item.id,
        nuevaCantidad,
      );
    } else {
      await this.shoppingCartRepository.createItem({
        carritoId: cart.id,
        productoVarianteId:
          dto.productoVarianteId,
        cantidad: dto.cantidad,
      });
    }

    const updatedCart =
      await this.shoppingCartRepository.findCompleteCartByCustomerId(
        client.id,
      );

    return this.shoppingCartMapper.toDto(updatedCart);
  }

  async updateItem(
    userId: string,
    itemId: string,
    dto: UpdateShoppingCartItemDto,
  ): Promise<ShoppingCartDto> {
    const client =
      await this.getClientByUserId(userId);

    const item =
      await this.shoppingCartRepository.findItemById(
        itemId,
      );

    if (!item) {
      throw new CartItemNotFoundException();
    }

    if (item.carrito.clienteId !== client.id) {
      throw new CartItemAccessDeniedException();
    }

    await this.getValidVariant(
      item.productoVarianteId,
      dto.cantidad,
    );

    await this.shoppingCartRepository.updateItemQuantity(
      item.id,
      dto.cantidad,
    );

    const cart =
      await this.shoppingCartRepository.findCompleteCartByCustomerId(
        client.id,
      );

    return this.shoppingCartMapper.toDto(cart);
  }

  async removeItem(
    userId: string,
    itemId: string,
  ): Promise<ShoppingCartDto> {
    const client =
      await this.getClientByUserId(userId);

    const item =
      await this.shoppingCartRepository.findItemById(
        itemId,
      );

    if (!item) {
      throw new CartItemNotFoundException();
    }

    if (item.carrito.clienteId !== client.id) {
      throw new CartItemAccessDeniedException();
    }

    await this.shoppingCartRepository.deleteItem(
      item.id,
    );

    const cart =
      await this.shoppingCartRepository.findCompleteCartByCustomerId(
        client.id,
      );

    return this.shoppingCartMapper.toDto(cart);
  }

  async clearCart(
    userId: string,
  ): Promise<ShoppingCartDto> {
    const client =
      await this.getClientByUserId(userId);

    const cart =
      await this.shoppingCartRepository.findByCustomerId(
        client.id,
      );

    if (!cart) {
      return this.shoppingCartMapper.toDto(null);
    }

    await this.shoppingCartRepository.deleteItemsByCartId(
      cart.id,
    );

    const updatedCart =
      await this.shoppingCartRepository.findCompleteCartByCustomerId(
        client.id,
      );

    return this.shoppingCartMapper.toDto(updatedCart);
  }

  private async getClientByUserId(userId: string) {
    const client =
      await this.userRepository.findClientByUserId(
        userId,
      );

    if (!client) {
      throw new CustomerNotFoundException();
    }

    return client;
  }

  private async getValidVariant(
    variantId: string,
    requestedQuantity: number,
  ) {
    const variant =
      await this.variantRepository.findCompleteById(
        variantId,
      );

    if (!variant) {
      throw new VariantNotFoundException();
    }

    if (!variant.activa) {
      throw new VariantNotFoundException();
    }

    if (
      !variant.producto.activo ||
      !variant.producto.publicado
    ) {
      throw new VariantNotFoundException();
    }

    const inventory = variant.inventario;

    if (!inventory) {
      throw new InsufficientStockException(0);
    }

    if (
      inventory.stockDisponible <
      requestedQuantity
    ) {
      throw new InsufficientStockException(
        inventory.stockDisponible,
      );
    }

    return variant;
  }
}