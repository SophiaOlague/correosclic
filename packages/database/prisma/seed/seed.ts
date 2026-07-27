import { PrismaClient } from '@prisma/client';

import { seedConfiguracionSistema } from './configuracion-sistema.seed.js';
import { seedRoles } from './roles.seed.js';
import { seedZonasTarifarias } from './zonas-tarifarias.seed.js';
import { seedTarifasEnvio } from './tarifas-envio.seed.js';
import { seedRegions } from './regions.seed.js';
import { seedUsers } from './users.seed.js';
import { seedAddresses } from './addresses.seed.js';
import { seedCatalog } from './catalog.seed.js';
import { seedShoppingCart } from './shopping-cart.seed.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 CorreosClic Seed\n');

  console.log('========== IAM ==========');
  await seedRoles(prisma);

  console.log('\n========== SYSTEM ==========');
  await seedConfiguracionSistema(prisma);

  await seedRegions(prisma);

  await seedUsers(prisma);

  await seedAddresses(prisma);

  await seedCatalog(prisma);

  await seedShoppingCart(prisma);

  await seedZonasTarifarias(prisma);

  await seedTarifasEnvio(prisma);

  console.log('\n🎉 Seed completado correctamente.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });