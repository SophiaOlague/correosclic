import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

import { AdminSellerController } from './controllers/admin-seller.controller';

import { AdminSellerService } from './application/services/admin-seller.service';

import { AdminSellerRepository } from './infrastructure/repositories/admin-seller.repository';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminSellerController,
  ],
  providers: [
    AdminSellerService,
    AdminSellerRepository,
  ],
})
export class AdminModule {}