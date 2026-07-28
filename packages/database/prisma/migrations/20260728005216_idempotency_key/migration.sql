-- CreateEnum
CREATE TYPE "EstadoIdempotencia" AS ENUM ('EN_PROCESO', 'COMPLETADA');

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "clave" VARCHAR(255) NOT NULL,
    "ruta" VARCHAR(255) NOT NULL,
    "huellaSolicitud" VARCHAR(64) NOT NULL,
    "estado" "EstadoIdempotencia" NOT NULL DEFAULT 'EN_PROCESO',
    "statusCode" INTEGER,
    "respuesta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completadoEn" TIMESTAMP(3),

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idempotency_keys_usuarioId_idx" ON "idempotency_keys"("usuarioId");

-- CreateIndex
CREATE INDEX "idempotency_keys_createdAt_idx" ON "idempotency_keys"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_usuarioId_clave_ruta_key" ON "idempotency_keys"("usuarioId", "clave", "ruta");

-- AddForeignKey
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
