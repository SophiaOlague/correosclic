import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';

import { LogisticsOrchestratorService } from '../application/services/logistics-orchestrator.service';
import { ConfirmReceptionDto } from '../application/dto/confirm-reception.dto';
import { ShipmentResponseDto } from '../application/dto/shipment-response.dto';

/**
 * El recepcionista solo certifica que el paquete fue recibido -- no toma
 * ninguna decisión logística. El orquestador se encarga del resto.
 */
@Controller('logistics/reception')
@UseGuards(JwtAuthGuard)
export class ReceptionController {
  constructor(
    private readonly orchestrator: LogisticsOrchestratorService,
  ) {}

  @Post()
  async confirm(
    @CurrentUser() user: AuthenticatedUserDto,
    @Body() dto: ConfirmReceptionDto,
  ): Promise<ShipmentResponseDto> {
    const envio = await this.orchestrator.confirmReception({
      trackingInterno: dto.trackingInterno,
      usuarioId: user.id,
      resultado: dto.resultado,
      observaciones: dto.observaciones,
      pesoRealKg: dto.pesoRealKg,
    });

    return ShipmentResponseDto.fromRecord(envio);
  }
}
