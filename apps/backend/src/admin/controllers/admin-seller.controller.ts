import {
  Controller,
  Get,
  Param,
  UseGuards,
  Patch,
  Body,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { AdminSellerService } from '../application/services/admin-seller.service';
import { RejectSellerRequestDto } from '../application/dto/reject-seller-request.dto';

@Controller('admin')
export class AdminSellerController {

  constructor(
    private readonly service: AdminSellerService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('seller-requests')
  async findPendingRequests() {
    return this.service.findPendingRequests();
  }
//ver a detalle solicitud
    @UseGuards(JwtAuthGuard)
  @Get('seller-requests/:id')
findRequestById(
  @Param('id') id: string,
) {
  return this.service.findRequestById(id);
}
//aprobar solicitud
@UseGuards(JwtAuthGuard)
@Patch('seller-requests/:id/approve')
approveRequest(
  @Param('id') id: string,
) {
  return this.service.approveRequest(id);
}
//Rechazar solicitud
@UseGuards(JwtAuthGuard)
@Patch('seller-requests/:id/reject')
rejectRequest(
  @Param('id') id: string,

  @Body()
  dto: RejectSellerRequestDto,
) {
  return this.service.rejectRequest(
    id,
    dto.comentariosRevision,
  );
}
}