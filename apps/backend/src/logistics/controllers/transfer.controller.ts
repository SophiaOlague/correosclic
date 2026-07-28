import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';

import { LogisticsOrchestratorService } from '../application/services/logistics-orchestrator.service';
import { ShipmentResponseDto } from '../application/dto/shipment-response.dto';

@Controller('logistics/transfers')
@UseGuards(JwtAuthGuard)
export class TransferController {
  constructor(
    private readonly orchestrator: LogisticsOrchestratorService,
  ) {}

  @Post(':id/arrival')
  async confirmArrival(
    @CurrentUser() user: AuthenticatedUserDto,
    @Param('id', ParseUUIDPipe) transferenciaId: string,
  ): Promise<ShipmentResponseDto> {
    const envio = await this.orchestrator.confirmTransferArrival({
      transferenciaId,
      usuarioId: user.id,
    });

    return ShipmentResponseDto.fromRecord(envio);
  }
}
