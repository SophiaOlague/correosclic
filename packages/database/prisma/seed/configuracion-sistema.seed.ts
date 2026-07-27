import { PrismaClient, Prisma } from '@prisma/client';

import { ConfiguracionSistemaKey } from '../constants/configuracion-sistema.constants.js';

export async function seedConfiguracionSistema(
  prisma: PrismaClient,
): Promise<void> {
  console.log('Seeding Configuración del Sistema...');

  await prisma.configuracionSistema.createMany({
    data: [
      {
  clave: ConfiguracionSistemaKey.MARKETPLACE_COMMISSION,
  valor: '10',
  descripcion: 'Comisión de CorreosClic (%)',
},
{
  clave: ConfiguracionSistemaKey.IVA_PERCENTAGE,
  valor: '16',
  descripcion: 'IVA vigente en México (%)',
},
{
  clave: ConfiguracionSistemaKey.CURRENCY,
  valor: 'MXN',
  descripcion: 'Moneda oficial del sistema',
},
{
  clave: ConfiguracionSistemaKey.PAYMENT_TIMEOUT_MINUTES,
  valor: '30',
  descripcion: 'Tiempo máximo para completar un pago',
},
{
  clave: ConfiguracionSistemaKey.VOLUMETRIC_FACTOR,
  valor: '6000',
  descripcion: 'Factor para calcular el peso volumétrico (L×A×H / factor)',
},
{
  clave: ConfiguracionSistemaKey.ADDITIONAL_VENDOR_SHIPPING_FACTOR,
  valor: '20',
  descripcion:
    'Porcentaje (%) que aporta cada vendedor adicional (distinto al de tarifa más alta) al costo de envío de un pedido multivendedor',
},
    ],
    skipDuplicates: true,
  });

  console.log(' Configuración del Sistema sembrada.');
}