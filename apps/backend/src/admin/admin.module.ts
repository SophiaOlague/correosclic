import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

import { AdminSellerController } from './controllers/admin-seller.controller';
import { AdminOperationsController } from './controllers/admin-operations.controller';

import { AdminSellerService } from './application/services/admin-seller.service';
import { AdminOperationsService } from './application/services/admin-operations.service';

import { AdminSellerRepository } from './infrastructure/repositories/admin-seller.repository';
import { AdminOperationsRepository } from './infrastructure/repositories/admin-operations.repository';
import { AdminSystemConfigRepository } from './infrastructure/repositories/admin-system-config.repository';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminSellerController,
    AdminOperationsController,
  ],
  providers: [
    AdminSellerService,
    AdminOperationsService,
    AdminSellerRepository,
    AdminOperationsRepository,
    AdminSystemConfigRepository,
  ],
})
export class AdminModule {}
