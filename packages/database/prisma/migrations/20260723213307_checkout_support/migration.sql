/*
  Warnings:

  - Added the required column `pesoKg` to the `pedidos_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "codigos_postales" ADD COLUMN     "latitud" DECIMAL(11,8),
ADD COLUMN     "longitud" DECIMAL(12,8);

-- AlterTable
ALTER TABLE "pagos" ADD COLUMN     "comisionStripe" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "pedidos_items" ADD COLUMN     "altoCm" DECIMAL(10,2),
ADD COLUMN     "anchoCm" DECIMAL(10,2),
ADD COLUMN     "largoCm" DECIMAL(10,2),
ADD COLUMN     "pesoKg" DECIMAL(10,3) NOT NULL;

-- CreateTable
CREATE TABLE "webhook_eventos" (
    "id" UUID NOT NULL,
    "proveedor" VARCHAR(30) NOT NULL,
    "eventoId" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(120) NOT NULL,
    "payload" JSONB NOT NULL,
    "firma" VARCHAR(500),
    "procesado" BOOLEAN NOT NULL DEFAULT false,
    "procesadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "webhook_eventos_procesado_idx" ON "webhook_eventos"("procesado");

-- CreateIndex
CREATE INDEX "webhook_eventos_tipo_idx" ON "webhook_eventos"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_eventos_proveedor_eventoId_key" ON "webhook_eventos"("proveedor", "eventoId");
