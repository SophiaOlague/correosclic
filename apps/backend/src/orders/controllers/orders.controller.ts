import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';
import { IdempotencyInterceptor } from '../../idempotency/application/interceptors/idempotency.interceptor';

import { OrdersService } from '../application/services/orders.service';
import { CreateOrderDto } from '../application/dto/create-order.dto';
import { OrderSummaryDto } from '../application/dto/order-summary.dto';
import { OrderListQueryDto } from '../application/dto/order-list-query.dto';
import { OrderListResponseDto } from '../application/dto/order-list-item.dto';
import { OrderDetailDto } from '../application/dto/order-detail.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  @Post()
  @UseInterceptors(IdempotencyInterceptor)
  create(
    @CurrentUser()
    user: AuthenticatedUserDto,

    @Body()
    dto: CreateOrderDto,
  ): Promise<OrderSummaryDto> {
    return this.ordersService.create(
      user.id,
      dto.direccionId,
    );
  }

  @Get()
  list(
    @CurrentUser()
    user: AuthenticatedUserDto,

    @Query()
    query: OrderListQueryDto,
  ): Promise<OrderListResponseDto> {
    return this.ordersService.list(
      user.id,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  @Get(':id')
  getById(
    @CurrentUser()
    user: AuthenticatedUserDto,

    @Param('id', ParseUUIDPipe)
    id: string,
  ): Promise<OrderDetailDto> {
    return this.ordersService.getById(user.id, id);
  }
}
