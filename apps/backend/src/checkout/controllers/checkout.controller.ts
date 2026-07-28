import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';

import { CheckoutService } from '../application/services/checkout.service';
import { CheckoutSummaryDto } from '../application/dto/checkout-summary.dto';
import { CheckoutQueryDto } from '../application/dto/checkout-query.dto';
import { CheckoutAddressDto } from '../application/dto/checkout-address.dto';

@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
  ) {}

  @Get()
  getCheckout(
    @CurrentUser()
    user: AuthenticatedUserDto,

    @Query()
    query: CheckoutQueryDto,
  ): Promise<CheckoutSummaryDto> {
    return this.checkoutService.getCheckout(
      user.id,
      query.direccionId,
    );
  }

  @Get('addresses')
  listAddresses(
    @CurrentUser()
    user: AuthenticatedUserDto,
  ): Promise<CheckoutAddressDto[]> {
    return this.checkoutService.listAddresses(user.id);
  }
}
