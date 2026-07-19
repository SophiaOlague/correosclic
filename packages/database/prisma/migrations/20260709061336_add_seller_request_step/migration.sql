-- CreateEnum
CREATE TYPE "PasoSolicitudVendedor" AS ENUM ('SOLICITUD', 'INFORMACION_FISCAL', 'DOCUMENTOS', 'REVISION', 'FINALIZADA');

-- AlterTable
ALTER TABLE "solicitudes_vendedor" ADD COLUMN     "pasoActual" "PasoSolicitudVendedor" NOT NULL DEFAULT 'SOLICITUD';
