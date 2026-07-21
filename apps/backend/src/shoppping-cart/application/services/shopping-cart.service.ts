import { Injectable } from '@nestjs/common';

import { ShoppingCartDto } from '../dto/shopping-cart.dto';
import { ShoppingCartMapper } from '../mappers/shopping-cart.mapper';

import { ShoppingCartRepository } from '../../infrastructure/repositories/shopping-cart.repository';
import { VariantRepository } from '../../../catalog/infrastructure/repositories/variant.repository';

import { AddShoppingCartItemDto } from '../dto/add-shopping-cart-item.dto';

import { InvalidQuantityException } from '../../domain/exceptions/invalid-quantity.exception';
import { InsufficientStockException } from '../../domain/exceptions/insufficient-stock.exception';

import { VariantNotFoundException } from '../../../catalog/domain/exceptions/variant-not-found.exception';
import { UserRepository } from '../../../auth/infrastructure/repositories/user.repository';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateShoppingCartItemDto } from '../dto/update-shopping-cart-item.dto';
import { CartItemAccessDeniedException } from '../dto/cart-item-access-denied.exception';
import { CartItemNotFoundException } from '../dto/cart-item-not-found.exception';



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
    await this.userRepository.findClientByUserId(
      userId,
    );

  if (!client) {
    throw new NotFoundException(
      'El cliente no existe.',
    );
  }

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
  await this.userRepository.findClientByUserId(
    userId,
  );

if (!client) {
  throw new NotFoundException(
    'El cliente no existe.',
  );
}

  if (dto.cantidad <= 0) {
  throw new InvalidQuantityException();
}

const variant =
  await this.variantRepository.findCompleteById(
    dto.productoVarianteId,
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

if (!variant.inventario) {
  throw new InsufficientStockException(0);
}

if (
  variant.inventario.stockDisponible <
  dto.cantidad
) {
  throw new InsufficientStockException(
    variant.inventario.stockDisponible,
  );
}

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
//El producto ya esta en el carrito, entonces actualizamos la cantidad
if (item) {

  const nuevaCantidad =
    item.cantidad + dto.cantidad;

  if (
    nuevaCantidad >
    variant.inventario.stockDisponible
  ) {
    throw new InsufficientStockException(
      variant.inventario.stockDisponible,
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

    cantidad:
      dto.cantidad,

  });

}
//Recuperar el carrito actualizado con los items y sus detalles
const updatedCart =
  await this.shoppingCartRepository.findCompleteCartByCustomerId(
    client.id,
  );
//finally, return the updated cart
  return this.shoppingCartMapper.toDto(updatedCart);
}

async updateItem(
  userId: string,
  itemId: string,
  dto: UpdateShoppingCartItemDto,
): Promise<ShoppingCartDto> {
  const client =
    await this.userRepository.findClientByUserId(
      userId,
    );

  if (!client) {
    throw new NotFoundException(
      'El cliente no existe.',
    );
  }

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

  // Obtenemos nuevamente la variante para validar su estado actual
  const variant =
    await this.variantRepository.findCompleteById(
      item.productoVarianteId,
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

  if (!variant.inventario) {
    throw new InsufficientStockException(0);
  }

  if (
    variant.inventario.stockDisponible <
    dto.cantidad
  ) {
    throw new InsufficientStockException(
      variant.inventario.stockDisponible,
    );
  }

  // Actualizamos la cantidad
  await this.shoppingCartRepository.updateItemQuantity(
    item.id,
    dto.cantidad,
  );

  // Recargamos el carrito para devolver la información actualizada
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
    await this.userRepository.findClientByUserId(
      userId,
    );

  if (!client) {
    throw new NotFoundException(
      'El cliente no existe.',
    );
  }

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
    await this.userRepository.findClientByUserId(
      userId,
    );

  if (!client) {
    throw new NotFoundException(
      'El cliente no existe.',
    );
  }

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

}