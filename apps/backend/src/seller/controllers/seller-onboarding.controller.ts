import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';

import { SellerOnboardingService } from '../application/services/seller-onboarding.service';

import { CreateFiscalInformationDto } from '../application/dto/create-fiscal-information.dto';

import { UploadSellerDocumentDto } from '../application/dto/upload-seller-document.dto';

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
}