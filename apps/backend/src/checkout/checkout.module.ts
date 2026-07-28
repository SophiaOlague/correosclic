import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SystemConfigModule } from '../system-config/system-config.module';

import { CheckoutService } from './application/services/checkout.service';
import { CheckoutController } from './controllers/checkout.controller';
import { CheckoutRepository } from './infrastructure/repositories/checkout.repository';
import { CheckoutTotalService } from './application/services/checkout-total.service';
import { ShippingCalculatorService } from './application/services/shipping-calculator.service';

import { HaversineDistanceCalculator } from './domain/services/haversine-distance.calculator';
import { SHIPPING_AGGREGATION_STRATEGY } from './domain/services/shipping-aggregation-strategy.interface';
import { HighestPlusPartialShippingAggregationStrategy } from './domain/services/highest-plus-partial-shipping-aggregation.strategy';

@Module({
  imports: [PrismaModule, AuthModule, SystemConfigModule],
  controllers: [CheckoutController],
  providers: [
    CheckoutService,
    CheckoutRepository,
    CheckoutTotalService,
    ShippingCalculatorService,
    HaversineDistanceCalculator,
    {
      provide: SHIPPING_AGGREGATION_STRATEGY,
      useClass: HighestPlusPartialShippingAggregationStrategy,
    },
  ],
  exports: [CheckoutService],
})
export class CheckoutModule {}
