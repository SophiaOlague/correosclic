import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { SellerOnboardingController } from './controllers/seller-onboarding.controller';
import { SellerOnboardingService } from './application/services/seller-onboarding.service';
import { SellerOnboardingRepository } from './infrastructure/repositories/seller-onboarding.repository';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    SellerOnboardingController,
  ],
  providers: [
    SellerOnboardingService,
    SellerOnboardingRepository,
  ],
  exports: [
    SellerOnboardingService,
  ],
})
export class SellerModule {}