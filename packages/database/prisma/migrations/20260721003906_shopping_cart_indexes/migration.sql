-- CreateIndex
CREATE INDEX "carritos_items_productoVarianteId_idx" ON "carritos_items"("productoVarianteId");

-- CreateIndex
CREATE INDEX "pedidos_items_pedidoId_vendedorId_idx" ON "pedidos_items"("pedidoId", "vendedorId");
