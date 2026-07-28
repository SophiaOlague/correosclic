import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CheckoutModule } from '../checkout/checkout.module';

import { OrdersController } from './controllers/orders.controller';

import { OrdersService } from './application/services/orders.service';
import { OrderPreparationService } from './application/services/order-preparation.service';
import { OrderCodeGenerator } from './domain/services/order-code-generator';
import { OrderRepository } from './infrastructure/repositories/order.repository';

@Module({
  imports: [PrismaModule, AuthModule, CheckoutModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrderPreparationService,
    OrderCodeGenerator,
    OrderRepository,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
