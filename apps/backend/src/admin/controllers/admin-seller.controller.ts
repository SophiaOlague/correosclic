import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Patch,
  Body,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ROLES } from '../../auth/constants/roles.constants';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';

import { AdminSellerService } from '../application/services/admin-seller.service';
import { RejectSellerRequestDto } from '../application/dto/reject-seller-request.dto';
import { ApproveSellerRequestDto } from '../application/dto/approve-seller-request.dto';

/**
 * Revisión de solicitudes de vendedor.
 *
 * Estos endpoints exponen datos fiscales y documentos de identidad de los
 * solicitantes, y `approve` crea un `Vendedor` y le concede el rol VENDEDOR.
 * Antes solo llevaban `JwtAuthGuard`, así que cualquier usuario autenticado
 * podía leer la PII de todos los solicitantes y aprobarse a sí mismo.
 *
 * Se restringe a SUPER_ADMIN, que es el rol que la semilla crea y el único
 * cuyo alcance es todo el marketplace. Si al construir los paneles
 * administrativos (Módulo 9) se decide que un ADMIN_REGIONAL también revisa
 * solicitudes, basta con añadirlo a `@Roles`.
 */
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.SUPER_ADMIN)
export class AdminSellerController {

  constructor(
    private readonly service: AdminSellerService,
  ) {}

  @Get('seller-requests')
  async findPendingRequests() {
    return this.service.findPendingRequests();
  }

  /**
   * Estados en los que puede operar un vendedor.
   *
   * Alimenta el selector obligatorio del formulario de aprobación; solo
   * devuelve los que tienen coordenadas, que son los únicos con los que el
   * motor logístico puede trabajar.
   */
  @Get('operating-states')
  findOperatingStates() {
    return this.service.findOperatingStates();
  }

//ver a detalle solicitud
  @Get('seller-requests/:id')
findRequestById(
  @Param('id', ParseUUIDPipe) id: string,
) {
  return this.service.findRequestById(id);
}
//aprobar solicitud
@Patch('seller-requests/:id/approve')
approveRequest(
  @CurrentUser() user: AuthenticatedUserDto,

  @Param('id', ParseUUIDPipe) id: string,

  @Body()
  dto: ApproveSellerRequestDto,
) {
  return this.service.approveRequest(
    id,
    dto.estadoOperacionId,
    user.id,
  );
}
//Rechazar solicitud
@Patch('seller-requests/:id/reject')
rejectRequest(
  @CurrentUser() user: AuthenticatedUserDto,

  @Param('id', ParseUUIDPipe) id: string,

  @Body()
  dto: RejectSellerRequestDto,
) {
  return this.service.rejectRequest(
    id,
    dto.comentariosRevision,
    user.id,
  );
}
}