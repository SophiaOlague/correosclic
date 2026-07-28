import {
  Controller,
  Get,
  UseGuards,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';

import { ShoppingCartService } from '../application/services/shopping-cart.service';
import { AddShoppingCartItemDto } from '../application/dto/add-shopping-cart-item.dto';
import { UpdateShoppingCartItemDto } from '../application/dto/update-shopping-cart-item.dto';
import { ShoppingCartDto } from '../application/dto/shopping-cart.dto';


@Controller('cart')
@UseGuards(JwtAuthGuard)
export class ShoppingCartController {
  constructor(
    private readonly shoppingCartService: ShoppingCartService,
  ) {}

  @Get()
  getCart(
    @CurrentUser()
    user: AuthenticatedUserDto,
  ) {
    return this.shoppingCartService.getCart(
      user.id,
    );
  }

  @Post('items')
addItem(
  @CurrentUser()
  user: AuthenticatedUserDto,

  @Body()
  dto: AddShoppingCartItemDto,
) {
  return this.shoppingCartService.addItem(
    user.id,
    dto,
  );
}

@Patch('items/:itemId')
updateItem(
  @CurrentUser() user: AuthenticatedUserDto,
  @Param('itemId') itemId: string,
  @Body() dto: UpdateShoppingCartItemDto,
): Promise<ShoppingCartDto> {
  return this.shoppingCartService.updateItem(
    user.id,
    itemId,
    dto,
  );
}

@Delete('items/:itemId')
removeItem(
  @CurrentUser() user: AuthenticatedUserDto,
  @Param('itemId') itemId: string,
): Promise<ShoppingCartDto> {
  return this.shoppingCartService.removeItem(
    user.id,
    itemId,
  );
}

@Delete()
clearCart(
  @CurrentUser() user: AuthenticatedUserDto,
): Promise<ShoppingCartDto> {
  return this.shoppingCartService.clearCart(
    user.id,
  );
}
}