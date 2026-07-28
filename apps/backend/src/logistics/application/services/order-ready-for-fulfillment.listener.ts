import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ShipmentCreationService } from './shipment-creation.service';

import {
  ORDER_READY_FOR_FULFILLMENT_EVENT,
  OrderReadyForFulfillmentEvent,
} from '../../../shared/events/order-ready-for-fulfillment.event';

/**
 * Único listener del único evento de dominio entre módulos. Todo lo que
 * ocurre dentro de Logistics a partir de aquí (confirmación de recepción,
 * transferencias, reparto) se dispara por llamadas HTTP directas al
 * LogisticsOrchestratorService, no por más eventos.
 */
@Injectable()
export class OrderReadyForFulfillmentListener {
  constructor(
    private readonly shipmentCreationService: ShipmentCreationService,
  ) {}

  @OnEvent(ORDER_READY_FOR_FULFILLMENT_EVENT)
  async handle(event: OrderReadyForFulfillmentEvent): Promise<void> {
    await this.shipmentCreationService.createShipmentsForOrder(
      event.pedidoId,
    );
  }
}
