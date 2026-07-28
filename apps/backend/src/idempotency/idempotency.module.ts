import { Global, Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { IdempotencyInterceptor } from './application/interceptors/idempotency.interceptor';
import { IdempotencyRepository } from './infrastructure/repositories/idempotency.repository';
import { RequestFingerprintService } from './domain/services/request-fingerprint.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    IdempotencyInterceptor,
    IdempotencyRepository,
    RequestFingerprintService,
  ],
  exports: [
    IdempotencyInterceptor,
    IdempotencyRepository,
    RequestFingerprintService,
  ],
})
export class IdempotencyModule {}
