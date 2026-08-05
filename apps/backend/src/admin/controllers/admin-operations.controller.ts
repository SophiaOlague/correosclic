import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ROLES } from '../../auth/constants/roles.constants';

import { AdminOperationsService } from '../application/services/admin-operations.service';
import { UpdateSystemConfigDto } from '../application/dto/update-system-config.dto';

/**
 * Lecturas de la red operativa y configuración del sistema.
 *
 * Mismo criterio de menor privilegio que el resto de `admin/`: solo
 * `SUPER_ADMIN`. Cuando se modelen los alcances de `ADMIN_REGIONAL` y
 * `ADMIN_LOCAL` se decidirá qué parte les corresponde.
 */
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.SUPER_ADMIN)
export class AdminOperationsController {
  constructor(private readonly service: AdminOperationsService) {}

  @Get('branches')
  findBranches() {
    return this.service.findBranches();
  }

  @Get('vehicles')
  findVehicles() {
    return this.service.findVehicles();
  }

  /** Las claves de negocio que declara `ConfiguracionSistemaKey`. */
  @Get('system-config')
  findSystemConfig() {
    return this.service.findSystemConfig();
  }

  /**
   * Cambia el valor de una clave.
   *
   * Estas claves alimentan cálculos en vivo —comisión del marketplace, IVA,
   * factor volumétrico, máximo de intentos de entrega—, así que un cambio aquí
   * afecta al siguiente pedido que se cotice.
   */
  @Patch('system-config/:clave')
  updateSystemConfig(
    @Param('clave') clave: string,

    @Body() dto: UpdateSystemConfigDto,
  ) {
    return this.service.updateSystemConfig(clave, dto.valor);
  }
}
