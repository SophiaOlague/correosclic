import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  Patch
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';

import { SellerOnboardingService } from '../application/services/seller-onboarding.service';

import { CreateFiscalInformationDto } from '../application/dto/create-fiscal-information.dto';

import { UploadSellerDocumentDto } from '../application/dto/upload-seller-document.dto';
import { CreateStoreDto } from '../application/dto/create-store.dto';

@Controller('seller')
export class SellerOnboardingController {
  constructor(
    private readonly sellerOnboardingService: SellerOnboardingService,
  ) {}
/**
   * Solicitud vigente del usuario. Es la primera consulta del asistente de
   * onboarding: de ella salen el paso actual, el estado de la revisión y, si
   * fue rechazada, el motivo.
   */
  @UseGuards(JwtAuthGuard)
  @Get('requests/me')
  findMyRequest(
    @CurrentUser() user: AuthenticatedUserDto,
  ) {
    return this.sellerOnboardingService.findMyRequest(user.id);
  }

  /** Tienda del vendedor autenticado. */
  @UseGuards(JwtAuthGuard)
  @Get('store')
  findMyStore(
    @CurrentUser() user: AuthenticatedUserDto,
  ) {
    return this.sellerOnboardingService.findMyStore(user.id);
  }

//UC-SELLER-001 Crear solicitud
  @UseGuards(JwtAuthGuard)
  @Post('requests')
  createRequest(
    @CurrentUser() user: AuthenticatedUserDto,
  ) {
    return this.sellerOnboardingService.createRequest(
      user.id,
    );
  }
//UC-SELLER-002 Información fiscal
  @UseGuards(JwtAuthGuard)
  @Post('requests/:id/fiscal-information')
  addFiscalInformation(
    @CurrentUser() user: AuthenticatedUserDto,
    @Param('id', ParseUUIDPipe) requestId: string,
    @Body() dto: CreateFiscalInformationDto,
  ) {
    return this.sellerOnboardingService.addFiscalInformation(
      user.id,
      requestId,
      dto,
    );
  }
//UC-SELLER-003 Subir documentos
@UseGuards(JwtAuthGuard)
@Post('requests/:id/documents')
addDocument(
  @CurrentUser() user: AuthenticatedUserDto,
  @Param('id', ParseUUIDPipe) requestId: string,
  @Body() dto: UploadSellerDocumentDto,
) {
  return this.sellerOnboardingService.addDocument(
    user.id,
    requestId,
    dto,
  );
}
//UC-SELLER-004 Enviar a revisión
@UseGuards(JwtAuthGuard)
@Patch('requests/:id/submit')
submitRequest(
  @CurrentUser() user: AuthenticatedUserDto,
  @Param('id', ParseUUIDPipe) requestId: string,
) {
  return this.sellerOnboardingService.submitRequest(
    user.id,
    requestId,
  );
}
//UC-SELLER-007 — Crear Tienda
@UseGuards(JwtAuthGuard)
@Post('store')
createStore(
  @CurrentUser()
  user: AuthenticatedUserDto,

  @Body()
  dto: CreateStoreDto,
) {
  return this.sellerOnboardingService.createStore(
    user.id,
    dto,
  );
}
}