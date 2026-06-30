import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../domain/services/password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async ping() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      module: 'auth',
      database: 'connected',
    };
  }
}