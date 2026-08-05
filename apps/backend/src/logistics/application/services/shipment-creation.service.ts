import { Injectable, Logger } from '@nestjs/common';

import { ShipmentRepository } from '../../infrastructure/repositories/shipment.repository';
import { BranchRepository } from '../../infrastructure/repositories/branch.repository';
import {
  BranchCandidate,
  NearestBranchResolver,
} from '../../domain/services/nearest-branch-resolver';
import { TrackingCodeGenerator } from '../../domain/services/tracking-code-generator';
import { HaversineDistanceCalculator } from '../../../shared/geo/haversine-distance.calculator';

interface PedidoVendedorContext {
  id: string;
  vendedorId: string;
  vendedor: {
    estadoOperacion: { latitud: unknown; longitud: unknown } | null;
  };
}

/**
 * Crea un Envio por cada PedidoVendedor de un pedido recién pagado (Opción
 * A del diseño: el Envio nace en PAGADO, no en la recepción física). Se
 * invoca desde OrderReadyForFulfillmentListener.
 */
@Injectable()
export class ShipmentCreationService {
  private readonly logger = new Logger(ShipmentCreationService.name);

  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly branchRepository: BranchRepository,
    private readonly nearestBranchResolver: NearestBranchResolver,
    private readonly trackingCodeGenerator: TrackingCodeGenerator,
    private readonly distanceCalculator: HaversineDistanceCalculator,
  ) {}

  async createShipmentsForOrder(pedidoId: string): Promise<void> {
    const orderContext =
      await this.shipmentRepository.findPaidOrderContext(pedidoId);

    if (!orderContext) {
      this.logger.warn(
        `Pedido ${pedidoId} no encontrado al intentar crear envíos.`,
      );
      return;
    }

    const sucursales = await this.branchRepository.findActiveWithCoordinates();

    if (sucursales.length === 0) {
      this.logger.error(
        `No hay sucursales activas -- no se pudieron crear envíos para el pedido ${pedidoId}.`,
      );
      return;
    }

    const destinoCoords = {
      latitud: Number(orderContext.direccionEntrega.latitud),
      longitud: Number(orderContext.direccionEntrega.longitud),
    };

    const sucursalDestino = this.nearestBranchResolver.resolve(
      destinoCoords,
      sucursales,
    );

    if (!sucursalDestino) {
      this.logger.error(
        `No se pudo resolver sucursal destino para el pedido ${pedidoId}.`,
      );
      return;
    }

    const itemsPorVendedor = new Map<
      string,
      { pedidoItemId: string; cantidad: number }[]
    >();

    for (const item of orderContext.items) {
      const items = itemsPorVendedor.get(item.vendedorId) ?? [];
      items.push({ pedidoItemId: item.id, cantidad: item.cantidad });
      itemsPorVendedor.set(item.vendedorId, items);
    }

    for (const pedidoVendedor of orderContext.pedidoVendedores) {
      await this.createShipmentForVendor(
        pedidoVendedor,
        sucursales,
        sucursalDestino,
        itemsPorVendedor.get(pedidoVendedor.vendedorId) ?? [],
      );
    }
  }

  private async createShipmentForVendor(
    pedidoVendedor: PedidoVendedorContext,
    sucursales: BranchCandidate[],
    sucursalDestino: BranchCandidate,
    items: { pedidoItemId: string; cantidad: number }[],
  ): Promise<void> {
    const yaExiste = await this.shipmentRepository.findByPedidoVendedorId(
      pedidoVendedor.id,
    );

    if (yaExiste) {
      this.logger.log(
        `Ya existe un Envio para PedidoVendedor ${pedidoVendedor.id} -- se omite (idempotencia).`,
      );
      return;
    }

    const estadoOperacion = pedidoVendedor.vendedor.estadoOperacion;

    if (
      !estadoOperacion ||
      estadoOperacion.latitud === null ||
      estadoOperacion.longitud === null
    ) {
      this.logger.warn(
        `Vendedor de PedidoVendedor ${pedidoVendedor.id} sin estadoOperacion con coordenadas -- no se pudo generar Envio.`,
      );
      return;
    }

    const origenCoords = {
      latitud: Number(estadoOperacion.latitud),
      longitud: Number(estadoOperacion.longitud),
    };

    const sucursalOrigen = this.nearestBranchResolver.resolve(
      origenCoords,
      sucursales,
    );

    if (!sucursalOrigen) {
      this.logger.warn(
        `No se pudo resolver sucursal origen para PedidoVendedor ${pedidoVendedor.id}.`,
      );
      return;
    }

    const distanciaKm = this.distanceCalculator.calculateKm(
      sucursalOrigen.coordenadas,
      sucursalDestino.coordenadas,
    );

    await this.shipmentRepository.create({
      pedidoVendedorId: pedidoVendedor.id,
      sucursalOrigenId: sucursalOrigen.id,
      sucursalDestinoId: sucursalDestino.id,
      trackingInterno: this.trackingCodeGenerator.generate(),
      distanciaKm,
      pedidoItemIds: items,
    });
  }
}
