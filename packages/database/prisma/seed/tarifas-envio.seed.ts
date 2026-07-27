import { PrismaClient, Prisma } from '@prisma/client';

import {
  MEXPOST_2025,
  MEXPOST_2025_VIGENCIA,
} from '../data/mexpost-2025.js';

export async function seedTarifasEnvio(
  prisma: PrismaClient,
): Promise<void> {

  const zonas = await prisma.zonaTarifaria.findMany();

  const zonasPorCodigo = new Map(
    zonas.map((z) => [z.codigo, z.id]),
  );

  const data: Prisma.TarifaEnvioCreateManyInput[] = [];

  for (const rango of MEXPOST_2025) {

    for (const [codigoZona, costo] of Object.entries(rango.precios)) {

      const zonaId = zonasPorCodigo.get(codigoZona);

      if (!zonaId) {
        throw new Error(`Zona ${codigoZona} no encontrada.`);
      }

        data.push({
        zonaTarifariaId: zonaId,

        pesoMinKg: rango.pesoMinKg,

        pesoMaxKg: rango.pesoMaxKg,

        precioConIva: costo,

        vigenteDesde: MEXPOST_2025_VIGENCIA,

        vigenteHasta: null,
        });
    }
  }

  await prisma.tarifaEnvio.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`✅ ${data.length} tarifas sembradas.`);
}