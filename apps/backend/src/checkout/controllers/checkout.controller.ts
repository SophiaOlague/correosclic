import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';

import { CheckoutService } from '../application/services/checkout.service';
import { CheckoutSummaryDto } from '../application/dto/checkout-summary.dto';

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
  ): Promise<CheckoutSummaryDto> {
    return this.checkoutService.getCheckout(user.id);
  }
}
