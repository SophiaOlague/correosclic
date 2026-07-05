import { PrismaClient } from '@prisma/client';

import { seedRoles } from './roles.seed';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 CorreosClic Seed');

  await seedRoles(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });