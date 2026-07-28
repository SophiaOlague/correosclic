import { PrismaClient, Prisma } from '@prisma/client';
import { ZONAS_TARIFARIAS } from '../data/zonas-tarifarias.js';

export async function seedZonasTarifarias(
  prisma: PrismaClient,
): Promise<void> {
  await prisma.zonaTarifaria.createMany({
    data: ZONAS_TARIFARIAS,
    skipDuplicates: true,
  });

  console.log('Zonas tarifarias sembradas.');
}