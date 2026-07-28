import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { SystemConfigRepository } from './infrastructure/repositories/system-config.repository';

@Module({
  imports: [PrismaModule],
  providers: [SystemConfigRepository],
  exports: [SystemConfigRepository],
})
export class SystemConfigModule {}
