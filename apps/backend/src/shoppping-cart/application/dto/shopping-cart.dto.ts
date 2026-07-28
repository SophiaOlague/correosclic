import { ShoppingCartItemDto } from './shopping-cart-item.dto';

export class ShoppingCartDto {
  id: string | null;

  items: ShoppingCartItemDto[];

  subtotal: number;

  total: number;
}