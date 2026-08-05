import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { SystemConfigModule } from '../system-config/system-config.module';

import { ShipmentRepository } from './infrastructure/repositories/shipment.repository';
import { BranchRepository } from './infrastructure/repositories/branch.repository';
import { CourierRepository } from './infrastructure/repositories/courier.repository';

import { ShipmentStateTransitionPolicy } from './domain/services/shipment-state-transition-policy';
import { RouteResolver } from './domain/services/route-resolver';
import { NearestBranchResolver } from './domain/services/nearest-branch-resolver';
import { VehicleCapacityPolicy } from './domain/services/vehicle-capacity-policy';
import { DeliveryAssignmentPolicy } from './domain/services/delivery-assignment-policy';
import { DeliveryRetryPolicy } from './domain/services/delivery-retry-policy';
import { TrackingCodeGenerator } from './domain/services/tracking-code-generator';

import { HaversineDistanceCalculator } from '../shared/geo/haversine-distance.calculator';

import { LogisticsPlanningEngine } from './application/services/logistics-planning.engine';
import { LogisticsOrchestratorService } from './application/services/logistics-orchestrator.service';
import { ShipmentCreationService } from './application/services/shipment-creation.service';
import { OrderReadyForFulfillmentListener } from './application/services/order-ready-for-fulfillment.listener';

import { ShipmentTrackingController } from './controllers/shipment-tracking.controller';
import { ReceptionController } from './controllers/reception.controller';
import { TransferController } from './controllers/transfer.controller';
import { DeliveryController } from './controllers/delivery.controller';
import { LogisticsOpsController } from './controllers/logistics-ops.controller';

@Module({
  imports: [PrismaModule, SystemConfigModule],
  controllers: [
    ShipmentTrackingController,
    ReceptionController,
    TransferController,
    DeliveryController,
    LogisticsOpsController,
  ],
  providers: [
    ShipmentRepository,
    BranchRepository,
    CourierRepository,

    ShipmentStateTransitionPolicy,
    RouteResolver,
    NearestBranchResolver,
    VehicleCapacityPolicy,
    DeliveryAssignmentPolicy,
    DeliveryRetryPolicy,
    TrackingCodeGenerator,
    HaversineDistanceCalculator,

    LogisticsPlanningEngine,
    LogisticsOrchestratorService,
    ShipmentCreationService,
    OrderReadyForFulfillmentListener,
  ],
})
export class LogisticsModule {}
