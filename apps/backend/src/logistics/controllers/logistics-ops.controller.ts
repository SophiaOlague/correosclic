import {
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

import { ShipmentRepository } from '../infrastructure/repositories/shipment.repository';
import { BranchRepository } from '../infrastructure/repositories/branch.repository';
import { LogisticsOrchestratorService } from '../application/services/logistics-orchestrator.service';
import { ShipmentNotFoundException } from '../domain/exceptions/shipment-not-found.exception';

import { ShipmentResponseDto } from '../application/dto/shipment-response.dto';
import { EmployeeBranchDto } from '../application/dto/employee-branch.dto';

@Controller('logistics')
@UseGuards(JwtAuthGuard)
export class LogisticsOpsController {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly branchRepository: BranchRepository,
    private readonly orchestrator: LogisticsOrchestratorService,
  ) {}

  /**
   * Sucursal del empleado autenticado. Es el punto de partida de todo el
   * panel de sucursal: las demás rutas de esta clase reciben el `sucursalId`
   * y verifican que coincida con el del empleado.
   */
  @Get('branches/me')
  async myBranch(
    @CurrentUser() user: AuthenticatedUserDto,
  ): Promise<EmployeeBranchDto> {
    const empleado = await this.branchRepository.findEmpleadoWithBranchByUsuarioId(
      user.id,
    );

    if (!empleado || !empleado.activo) {
      throw new ShipmentNotFoundException();
    }

    return {
      empleadoId: empleado.id,
      puesto: empleado.puesto,
      sucursalId: empleado.sucursal.id,
      codigo: empleado.sucursal.codigo,
      nombre: empleado.sucursal.nombre,
    };
  }

  @Get('branches/:sucursalId/reception-queue')
  async receptionQueue(
    @CurrentUser() user: AuthenticatedUserDto,
    @Param('sucursalId', ParseUUIDPipe) sucursalId: string,
  ) {
    await this.assertEmpleadoDeSucursal(user.id, sucursalId);

    return this.shipmentRepository.findReceptionQueue(sucursalId);
  }

  @Get('branches/:sucursalId/dispatch-queue')
  async dispatchQueue(
    @CurrentUser() user: AuthenticatedUserDto,
    @Param('sucursalId', ParseUUIDPipe) sucursalId: string,
  ) {
    await this.assertEmpleadoDeSucursal(user.id, sucursalId);

    return this.shipmentRepository.findDispatchQueue(sucursalId);
  }

  @Post('shipments/:id/retry-planning')
  async retryPlanning(
    @CurrentUser() user: AuthenticatedUserDto,
    @Param('id', ParseUUIDPipe) envioId: string,
  ): Promise<ShipmentResponseDto> {
    const envio = await this.orchestrator.retryPlanning({
      envioId,
      usuarioId: user.id,
    });

    return ShipmentResponseDto.fromRecord(envio);
  }

  private async assertEmpleadoDeSucursal(
    usuarioId: string,
    sucursalId: string,
  ): Promise<void> {
    const empleado =
      await this.branchRepository.findEmpleadoByUsuarioId(usuarioId);

    if (!empleado || !empleado.activo || empleado.sucursalId !== sucursalId) {
      throw new ShipmentNotFoundException();
    }
  }
}
