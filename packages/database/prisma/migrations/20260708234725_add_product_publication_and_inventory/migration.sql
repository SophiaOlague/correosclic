/*
  Warnings:

  - You are about to drop the column `stock` on the `productos_variantes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "publicado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "productos_variantes" DROP COLUMN "stock";

-- CreateTable
CREATE TABLE "inventarios" (
    "id" UUID NOT NULL,
    "productoVarianteId" UUID NOT NULL,
    "stockDisponible" INTEGER NOT NULL DEFAULT 0,
    "stockReservado" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventarios_productoVarianteId_key" ON "inventarios"("productoVarianteId");

-- CreateIndex
CREATE INDEX "inventarios_stockDisponible_idx" ON "inventarios"("stockDisponible");

-- CreateIndex
CREATE INDEX "productos_publicado_idx" ON "productos"("publicado");

-- AddForeignKey
ALTER TABLE "inventarios" ADD CONSTRAINT "inventarios_productoVarianteId_fkey" FOREIGN KEY ("productoVarianteId") REFERENCES "productos_variantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
