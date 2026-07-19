/*
  Warnings:

  - Changed the type of `tipoDocumento` on the `documentos_vendedor` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoDocumentoVendedor" AS ENUM ('INE', 'CONSTANCIA_SITUACION_FISCAL', 'COMPROBANTE_DOMICILIO');

-- AlterTable
ALTER TABLE "documentos_vendedor" DROP COLUMN "tipoDocumento",
ADD COLUMN     "tipoDocumento" "TipoDocumentoVendedor" NOT NULL;
