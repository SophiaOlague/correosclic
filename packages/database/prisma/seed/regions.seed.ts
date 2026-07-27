import { PrismaClient } from '@prisma/client';

export async function seedRegions(
  prisma: PrismaClient,
): Promise<void> {
  console.log('🌎 Sembrando geografía...');

  // País
  const mexico = await prisma.pais.upsert({
    where: {
      codigoIso2: 'MX',
    },
    update: {},
    create: {
      nombre: 'México',
      codigoIso2: 'MX',
      codigoIso3: 'MEX',
    },
  });

  // Región
  const region = await prisma.region.upsert({
    where: {
      nombre: 'Noroeste',
    },
    update: {},
    create: {
      nombre: 'Noroeste',
      descripcion: 'Región de desarrollo',
    },
  });

  // Estado
  const durango = await prisma.estadoProvincia.upsert({
    where: {
      paisId_nombre: {
        paisId: mexico.id,
        nombre: 'Durango',
      },
    },
    update: {
      latitud: 24.027720,
      longitud: -104.653175,
    },
    create: {
      paisId: mexico.id,
      regionId: region.id,
      nombre: 'Durango',
      codigo: 'DGO',
      latitud: 24.027720,
      longitud: -104.653175,
    },
  });

  // Ciudad
  const ciudadDurango = await prisma.ciudad.upsert({
    where: {
      estadoProvinciaId_nombre: {
        estadoProvinciaId: durango.id,
        nombre: 'Durango',
      },
    },
    update: {},
    create: {
      estadoProvinciaId: durango.id,
      nombre: 'Durango',
    },
  });

  // Código Postal 34000
  await prisma.codigoPostal.upsert({
    where: {
      ciudadId_codigo: {
        ciudadId: ciudadDurango.id,
        codigo: '34000',
      },
    },
    update: {},
    create: {
      ciudadId: ciudadDurango.id,
      codigo: '34000',
      latitud: 24.027720,
      longitud: -104.653175,
    },
  });

  // Código Postal 34180
  await prisma.codigoPostal.upsert({
    where: {
      ciudadId_codigo: {
        ciudadId: ciudadDurango.id,
        codigo: '34180',
      },
    },
    update: {},
    create: {
      ciudadId: ciudadDurango.id,
      codigo: '34180',
      latitud: 24.008930,
      longitud: -104.640890,
    },
  });

  console.log('   ✅ Geografía lista');
}