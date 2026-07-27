import { PrismaClient } from '@prisma/client';

interface CodigoPostalSeedData {
  codigo: string;
  latitud: number;
  longitud: number;
}

interface EstadoSeedData {
  region: string;
  estado: string;
  codigo: string;
  latitud: number;
  longitud: number;
  ciudad: string;
  codigosPostales: CodigoPostalSeedData[];
}

/**
 * Varios estados en distintas zonas de distancia (A-G respecto a Durango)
 * para poder probar checkout multivendedor sin capturar datos a mano.
 */
const ESTADOS: EstadoSeedData[] = [
  {
    region: 'Noroeste',
    estado: 'Durango',
    codigo: 'DGO',
    latitud: 24.02772,
    longitud: -104.653175,
    ciudad: 'Durango',
    codigosPostales: [
      { codigo: '34000', latitud: 24.02772, longitud: -104.653175 },
      { codigo: '34180', latitud: 24.00893, longitud: -104.64089 },
    ],
  },
  {
    region: 'Occidente',
    estado: 'Jalisco',
    codigo: 'JAL',
    latitud: 20.6597,
    longitud: -103.3496,
    ciudad: 'Guadalajara',
    codigosPostales: [
      { codigo: '44100', latitud: 20.6597, longitud: -103.3496 },
    ],
  },
  {
    region: 'Sureste',
    estado: 'Quintana Roo',
    codigo: 'ROO',
    latitud: 21.1619,
    longitud: -86.8515,
    ciudad: 'Cancún',
    codigosPostales: [
      { codigo: '77500', latitud: 21.1619, longitud: -86.8515 },
    ],
  },
];

export async function seedRegions(
  prisma: PrismaClient,
): Promise<void> {
  console.log('🌎 Sembrando geografía...');

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

  for (const data of ESTADOS) {
    const region = await prisma.region.upsert({
      where: {
        nombre: data.region,
      },
      update: {},
      create: {
        nombre: data.region,
        descripcion: 'Región de desarrollo',
      },
    });

    const estado = await prisma.estadoProvincia.upsert({
      where: {
        paisId_nombre: {
          paisId: mexico.id,
          nombre: data.estado,
        },
      },
      update: {
        latitud: data.latitud,
        longitud: data.longitud,
      },
      create: {
        paisId: mexico.id,
        regionId: region.id,
        nombre: data.estado,
        codigo: data.codigo,
        latitud: data.latitud,
        longitud: data.longitud,
      },
    });

    const ciudad = await prisma.ciudad.upsert({
      where: {
        estadoProvinciaId_nombre: {
          estadoProvinciaId: estado.id,
          nombre: data.ciudad,
        },
      },
      update: {},
      create: {
        estadoProvinciaId: estado.id,
        nombre: data.ciudad,
      },
    });

    for (const cp of data.codigosPostales) {
      await prisma.codigoPostal.upsert({
        where: {
          ciudadId_codigo: {
            ciudadId: ciudad.id,
            codigo: cp.codigo,
          },
        },
        update: {},
        create: {
          ciudadId: ciudad.id,
          codigo: cp.codigo,
          latitud: cp.latitud,
          longitud: cp.longitud,
        },
      });
    }
  }

  console.log(
    `   ✅ Geografía lista (${ESTADOS.length} estados)`,
  );
}
