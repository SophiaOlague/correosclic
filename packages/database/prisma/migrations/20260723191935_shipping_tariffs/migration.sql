-- AlterTable
ALTER TABLE "envios" ADD COLUMN     "costoEnvio" DECIMAL(12,2),
ADD COLUMN     "distanciaKm" DECIMAL(10,2),
ADD COLUMN     "fechaDespacho" TIMESTAMP(3),
ADD COLUMN     "pesoCobrableKg" DECIMAL(10,3),
ADD COLUMN     "pesoRealKg" DECIMAL(10,3),
ADD COLUMN     "pesoVolumetricoKg" DECIMAL(10,3),
ADD COLUMN     "tarifaEnvioId" UUID,
ADD COLUMN     "zonaTarifariaId" UUID;

-- CreateTable
CREATE TABLE "zonas_tarifarias" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(5) NOT NULL,
    "descripcion" VARCHAR(255),
    "distanciaMinKm" DECIMAL(10,2) NOT NULL,
    "distanciaMaxKm" DECIMAL(10,2),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zonas_tarifarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarifas_envio" (
    "id" UUID NOT NULL,
    "zonaTarifariaId" UUID NOT NULL,
    "pesoMinKg" DECIMAL(10,3) NOT NULL,
    "pesoMaxKg" DECIMAL(10,3) NOT NULL,
    "precioConIva" DECIMAL(12,2) NOT NULL,
    "vigenteDesde" TIMESTAMP(3) NOT NULL,
    "vigenteHasta" TIMESTAMP(3),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarifas_envio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "zonas_tarifarias_codigo_key" ON "zonas_tarifarias"("codigo");

-- CreateIndex
CREATE INDEX "zonas_tarifarias_activa_idx" ON "zonas_tarifarias"("activa");

-- CreateIndex
CREATE INDEX "tarifas_envio_zonaTarifariaId_idx" ON "tarifas_envio"("zonaTarifariaId");

-- CreateIndex
CREATE INDEX "tarifas_envio_activa_idx" ON "tarifas_envio"("activa");

-- CreateIndex
CREATE UNIQUE INDEX "tarifas_envio_zonaTarifariaId_pesoMinKg_pesoMaxKg_vigenteDe_key" ON "tarifas_envio"("zonaTarifariaId", "pesoMinKg", "pesoMaxKg", "vigenteDesde");

-- CreateIndex
CREATE INDEX "envios_zonaTarifariaId_idx" ON "envios"("zonaTarifariaId");

-- CreateIndex
CREATE INDEX "envios_tarifaEnvioId_idx" ON "envios"("tarifaEnvioId");

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_zonaTarifariaId_fkey" FOREIGN KEY ("zonaTarifariaId") REFERENCES "zonas_tarifarias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_tarifaEnvioId_fkey" FOREIGN KEY ("tarifaEnvioId") REFERENCES "tarifas_envio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarifas_envio" ADD CONSTRAINT "tarifas_envio_zonaTarifariaId_fkey" FOREIGN KEY ("zonaTarifariaId") REFERENCES "zonas_tarifarias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
