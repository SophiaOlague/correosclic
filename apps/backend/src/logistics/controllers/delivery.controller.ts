import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';

import { CourierRepository } from '../infrastructure/repositories/courier.repository';
import { LogisticsOrchestratorService } from '../application/services/logistics-orchestrator.service';
import { ShipmentNotFoundException } from '../domain/exceptions/shipment-not-found.exception';

import { RecordDeliveryAttemptDto } from '../application/dto/record-delivery-attempt.dto';
import { ShipmentResponseDto } from '../application/dto/shipment-response.dto';

@Controller('logistics')
@UseGuards(JwtAuthGuard)
export class DeliveryController {
  constructor(
    private readonly courierRepository: CourierRepository,
    private readonly orchestrator: LogisticsOrchestratorService,
  ) {}

  @Get('couriers/me/deliveries')
  async listMyDeliveries(@CurrentUser() user: AuthenticatedUserDto) {
    const repartidor = await this.courierRepository.findByUsuarioId(user.id);

    if (!repartidor || !repartidor.activo) {
      throw new ShipmentNotFoundException();
    }

    const entregas =
      await this.courierRepository.findActiveEntregasByRepartidorId(
        repartidor.id,
      );

    return entregas.map((entrega) => ({
      entregaId: entrega.id,
      envioId: entrega.envio.id,
      trackingInterno: entrega.envio.trackingInterno,
      estado: entrega.envio.estado,
      fechaAsignacion: entrega.fechaAsignacion,
    }));
  }

  @Post('deliveries/:entregaId/attempts')
  async recordAttempt(
    @CurrentUser() user: AuthenticatedUserDto,
    @Param('entregaId', ParseUUIDPipe) entregaId: string,
    @Body() dto: RecordDeliveryAttemptDto,
  ): Promise<ShipmentResponseDto> {
    const envio = await this.orchestrator.recordDeliveryAttempt({
      entregaId,
      usuarioId: user.id,
      resultado: dto.resultado,
      observaciones: dto.observaciones,
      fotoIntentoUrl: dto.fotoIntentoUrl,
      nombreRecibe: dto.nombreRecibe,
    });

    return ShipmentResponseDto.fromRecord(envio);
  }
}
