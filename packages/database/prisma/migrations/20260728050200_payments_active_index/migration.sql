-- Índice único PARCIAL: solo un Pago "activo" (no terminal) por pedido a la vez.
-- No representable en el DSL de Prisma (no soporta índices condicionales),
-- por eso se agrega a mano aquí. Ver comentario en el modelo Pago en schema.prisma.
-- Separado de la migración anterior porque Postgres exige que los valores
-- nuevos de un enum estén comprometidos antes de poder usarse en una expresión.
CREATE UNIQUE INDEX "pagos_pedido_activo_unique" ON "pagos"("pedidoId")
  WHERE "estado" IN ('PENDIENTE', 'REQUIERE_ACCION', 'PROCESANDO');
