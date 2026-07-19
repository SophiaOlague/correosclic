import {
  Body,
  Controller,
  Param,
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
    @Param('id') requestId: string,
    @Body() dto: CreateFiscalInformationDto,
  ) {
    return this.sellerOnboardingService.addFiscalInformation(
      requestId,
      dto,
    );
  }
//UC-SELLER-003 Subir documentos
@UseGuards(JwtAuthGuard)
@Post('requests/:id/documents')
addDocument(
  @Param('id') requestId: string,
  @Body() dto: UploadSellerDocumentDto,
) {
  return this.sellerOnboardingService.addDocument(
    requestId,
    dto,
  );
}
//UC-SELLER-004 Enviar a revisión
@UseGuards(JwtAuthGuard)
@Patch('requests/:id/submit')
submitRequest(
  @Param('id') requestId: string,
) {
  return this.sellerOnboardingService.submitRequest(
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