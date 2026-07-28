import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';
import { IdempotencyInterceptor } from '../../idempotency/application/interceptors/idempotency.interceptor';

import { PaymentIntentService } from '../application/services/payment-intent.service';
import { CreatePaymentIntentDto } from '../application/dto/create-payment-intent.dto';
import { PaymentIntentResponseDto } from '../application/dto/payment-intent-response.dto';
import { PaymentStatusDto } from '../application/dto/payment-status.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentIntentService: PaymentIntentService,
  ) {}

  @Post('intent')
  @UseInterceptors(IdempotencyInterceptor)
  createIntent(
    @CurrentUser()
    user: AuthenticatedUserDto,

    @Body()
    dto: CreatePaymentIntentDto,

    @Headers('idempotency-key')
    idempotencyKey: string,
  ): Promise<PaymentIntentResponseDto> {
    return this.paymentIntentService.createOrReuse(
      user.id,
      dto.orderId,
      idempotencyKey,
    );
  }

  @Get('order/:orderId')
  getStatus(
    @CurrentUser()
    user: AuthenticatedUserDto,

    @Param('orderId', ParseUUIDPipe)
    orderId: string,
  ): Promise<PaymentStatusDto> {
    return this.paymentIntentService.getStatus(
      user.id,
      orderId,
    );
  }
}
