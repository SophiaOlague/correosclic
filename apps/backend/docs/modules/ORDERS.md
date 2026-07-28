# Módulo Orders

Estado: implementado (creación + lectura). Pagos, logística y webhooks quedan fuera de este documento porque aún no existen.

## 1. Responsabilidades

- Convertir el carrito de un cliente autenticado en un `Pedido` persistido, dentro de una transacción atómica.
- **No recalcular ninguna regla de negocio propia de Checkout.** Subtotal, envío multivendedor, IVA y comisión se obtienen siempre llamando a `CheckoutService` — Orders solo los persiste.
- Repartir el pedido en una porción por vendedor (`PedidoVendedor`), como base para que Logistics y Payments operen por vendedor sin acoplarse entre sí.
- Reservar inventario (`stockDisponible` → `stockReservado`) sin permitir sobreventa por condición de carrera.
- Garantizar que un mismo intento de compra (reintento de red, doble clic, doble tab) no cree pedidos duplicados (`Idempotency-Key`).
- Exponer lectura del historial de pedidos del cliente: lista resumida y detalle completo agrupado por vendedor.

Fuera de alcance del módulo, a propósito: cobro (Stripe/PaymentIntent), webhooks, generación de guías, tracking, reembolsos.

## 2. Estructura de carpetas

```
orders/
├── orders.module.ts
├── application/
│   ├── dto/                  CreateOrderDto, OrderSummaryDto,
│   │                         OrderListQueryDto, OrderListItemDto/OrderListResponseDto,
│   │                         OrderDetailDto (+ tipos anidados)
│   ├── interfaces/           PreparedOrder / PreparedOrderItem / PreparedOrderVendor
│   └── services/
│       ├── order-preparation.service.ts   arma el pedido en memoria (solo lectura)
│       └── orders.service.ts              orquesta: prepara -> persiste -> mapea DTOs
├── controllers/
│   └── orders.controller.ts  POST /orders, GET /orders, GET /orders/:id
├── domain/
│   ├── exceptions/           CustomerNotFoundException, OrderNotFoundException,
│   │                         OrderStockConflictException
│   └── services/
│       └── order-code-generator.ts        genera codigoPedido (ORD-{timestamp}-{sufijo})
└── infrastructure/
    └── repositories/
        └── order.repository.ts            único punto de acceso a Prisma del módulo
```

## 3. Flujo completo de `POST /orders`

Protegido por `JwtAuthGuard` + `IdempotencyInterceptor`. Requiere header `Idempotency-Key`.

```
Cliente                Interceptor           OrdersService          OrderPreparationService      CheckoutService        OrderRepository
   │  POST /orders           │                     │                        │                         │                      │
   │  Idempotency-Key: K     │                     │                        │                         │                      │
   ├────────────────────────►│                     │                        │                         │                      │
   │                         │ claim(usuario,K,ruta)                        │                         │                      │
   │                         │  ├─ ya COMPLETADA ──────────────────────────────────────────────────────────────────► devuelve la misma respuesta, NO ejecuta nada más
   │                         │  ├─ EN_PROCESO ─────────────────────────────────────────────────────────────────────► 409 Conflict
   │                         │  └─ nueva ──────────►│                        │                         │                      │
   │                         │                      │  create(userId, dir?) │                         │                      │
   │                         │                      ├───────────────────────►                         │                      │
   │                         │                      │                       │  getCheckout(userId,dir?)│                      │
   │                         │                      │                       ├──────────────────────────►                      │
   │                         │                      │                       │  (revalida stock,        │                      │
   │                         │                      │                       │   recalcula subtotal/    │                      │
   │                         │                      │                       │   envío/IVA/comisión)     │                      │
   │                         │                      │                       │◄──────────────────────────┤ CheckoutSummaryDto  │
   │                         │                      │                       │  si !canCheckout ->       │                      │
   │                         │                      │                       │  OrderStockConflictException                     │
   │                         │                      │                       │  arma PreparedOrder       │                      │
   │                         │                      │                       │  (items + vendedores)     │                      │
   │                         │                      │◄──────────────────────┤                         │                      │
   │                         │                      │  createOrder(prepared)                           │                      │
   │                         │                      ├───────────────────────────────────────────────────────────────────────►│
   │                         │                      │                       │                         │  $transaction:       │
   │                         │                      │                       │                         │   1. reserva stock   │
   │                         │                      │                       │                         │      (atómico)       │
   │                         │                      │                       │                         │   2. crea Pedido +   │
   │                         │                      │                       │                         │      PedidoItem[] +  │
   │                         │                      │                       │                         │      PedidoVendedor[]│
   │                         │                      │                       │                         │   3. vacía carrito   │
   │                         │                      │◄──────────────────────────────────────────────────────────────────────┤ Pedido
   │                         │◄─────────────────────┤ OrderSummaryDto       │                         │                      │
   │                         │  complete(id, 201, respuesta) — cachea la respuesta                     │                      │
   │◄────────────────────────┤ 201 OrderSummaryDto  │                        │                         │                      │
```

Si cualquier paso dentro del `$transaction` falla (ej. stock insuficiente al reservar), **nada** se persiste — ni Pedido, ni items, ni se vacía el carrito — y el interceptor libera la clave de idempotencia para permitir reintentar.

## 4. Flujo de `GET /orders`

1. `JwtAuthGuard` autentica; se resuelve `Cliente` a partir del `usuarioId`.
2. `OrderRepository.findManyByClientId` pagina (`page`/`limit`, default 1/20) ordenando por `createdAt desc`, trayendo solo lo necesario para el resumen (no el detalle financiero completo).
3. Por cada pedido se calcula: `cantidadArticulos` (suma de `PedidoItem.cantidad`), `numeroVendedores` (`_count.pedidoVendedores`), `miniaturaUrl` (imagen del primer item, si existe).
4. No usa `IdempotencyInterceptor` (GET ya es idempotente por naturaleza).

## 5. Flujo de `GET /orders/:id`

1. `ParseUUIDPipe` valida el formato del id antes de tocar la base de datos.
2. `OrderRepository.findByIdAndClientId(id, clienteId)` — el filtro por `clienteId` es el control de ownership: si el pedido no es del usuario autenticado, la consulta no devuelve nada y se responde `404` (no `403`, para no confirmar que el pedido existe).
3. El servicio agrupa `PedidoItem[]` por `vendedorId` y los fusiona con su `PedidoVendedor` correspondiente, arma la dirección de entrega y el resumen financiero del pedido.
4. Devuelve `OrderDetailDto`: dirección, resumen financiero global, y un arreglo `vendedores[]` donde cada uno trae su propio desglose (`subtotal`, `costoEnvioAsignado`, `comisionMarketplace`, `totalPedido`, `estado`) y sus `items[]`.

## 6. Modelos involucrados

### `Pedido`

Representa la compra completa del cliente.

| Campo | Rol |
|---|---|
| `codigoPedido` | Único, generado por `OrderCodeGenerator` (`ORD-{timestamp}-{sufijo aleatorio}`) |
| `estado` (`EstadoPedido`) | Estado global. Hoy siempre `PENDIENTE_PAGO` al crear; no hay lógica de transición todavía (ver §9) |
| `subtotal`, `costoEnvio`, `comisionCorreosClic`, `totalVendedores`, `total` | Copiados 1:1 de `CheckoutSummaryDto`, nunca recalculados por Orders |
| `direccionEntregaId` | La dirección que Checkout resolvió y cotizó (`checkout.direccionId`), no una nueva resolución |

### `PedidoItem`

Snapshot de cada línea comprada — deliberadamente desnormalizado.

| Campo | Por qué es snapshot |
|---|---|
| `nombreTienda`, `nombreProducto`, `sku`, `imagenUrl` | Si el producto cambia de nombre, se elimina, o cambia de imagen después, el pedido conserva lo que el cliente vio al comprar |
| `precioUnitario`, `subtotal`, `pesoKg` | El precio pudo cambiar; el pedido factura el precio del momento de la compra |
| `vendedorId` | Ancla el item a su `PedidoVendedor` |

### `PedidoVendedor`

Porción del pedido que corresponde a un vendedor — **entidad de dominio propia**, no solo un desglose financiero. Es el punto de anclaje pensado para que Logistics (`Envio.pedidoVendedorId`, a futuro) y Payments/Payouts se conecten sin tocar este modelo.

| Campo | Cómo se calcula |
|---|---|
| `estado` (`EstadoPedidoVendedor`, enum **independiente** de `EstadoPedido`) | Cada vendedor podrá avanzar (preparar/enviar/entregar) a su propio ritmo dentro del mismo pedido |
| `subtotal` | Suma de `subtotal` de los `PedidoItem` de ese vendedor |
| `costoEnvioAsignado` | El monto que Checkout ya le asignó en `envioDetalle` (la tarifa completa si fue la base del cálculo multivendedor, o el 20% de recargo si fue adicional) |
| `comisionMarketplace` | Reparto proporcional de `checkout.comisionMarketplace` según la participación de ese vendedor en el subtotal — informativo, no se resta del total |
| `totalPedido` | `subtotal + costoEnvioAsignado` (**sin** restar comisión: representa la porción del pago del cliente, no lo que se liquidará al vendedor) |

La suma de todos los `PedidoVendedor` de un pedido cuadra exacto contra los totales de `Pedido` (verificado en pruebas reales, sin deriva de redondeo).

## 7. Estrategia de snapshots

Todo lo que puede cambiar después de la compra (nombre/precio/imagen de producto, nombre de tienda) se copia al crear el pedido en vez de vivir como referencia viva. Es el mismo principio que ya traía `PedidoItem` en el schema original, extendido a `imagenUrl` (migración aditiva) para que `GET /orders` pueda mostrar una miniatura sin depender de que el producto siga existiendo. Los campos que **sí** son referencias vivas (`productoVarianteId`, `vendedorId`) son identificadores, no datos mostrables — se usan para trazabilidad, no para render.

## 8. Estrategia de reserva de inventario

Dentro de la misma transacción que crea el pedido, por cada item:

```ts
tx.inventario.updateMany({
  where: { productoVarianteId, stockDisponible: { gte: cantidad } },
  data: {
    stockDisponible: { decrement: cantidad },
    stockReservado: { increment: cantidad },
  },
});
```

Es un **update condicionado**, no un patrón lectura-luego-escritura: la condición `stockDisponible >= cantidad` se evalúa atómicamente en la misma sentencia SQL, así que dos pedidos compitiendo por el último stock no pueden sobrevender aunque se ejecuten al mismo tiempo. Si `updateMany` afecta 0 filas, se lanza `OrderStockConflictException` (`409`) y la transacción completa se revierte. El inventario se mueve de `stockDisponible` a `stockReservado` — no se descuenta directamente, queda reservado hasta que un futuro flujo de pago lo confirme o libere.

## 9. Uso de `Idempotency-Key`

Diseño genérico (inspirado en Stripe), vive en su propio módulo (`idempotency/`, `@Global()`) y se activa por endpoint con `@UseInterceptors(IdempotencyInterceptor)` — hoy solo en `POST /orders`, reutilizable tal cual en Payments.

- El cliente genera un UUID por intento de compra y lo manda en el header `Idempotency-Key`.
- El servidor reserva `(usuarioId, clave, ruta)` con un `INSERT` atómico (unique constraint) — sin lectura-antes-de-escribir, sin condición de carrera posible.
- Si la clave ya existe y **terminó** (`COMPLETADA`): devuelve la respuesta cacheada tal cual, sin ejecutar el handler de nuevo.
- Si la clave ya existe pero **el body es distinto** (comparado por hash SHA-256 del body): `422`, es un error de uso de la clave (se reutilizó para una operación distinta).
- Si la clave ya existe y sigue **en proceso**: `409`.
- Si la operación fallara, la clave se libera (se borra) para permitir reintentar con la misma.

## 10. Decisiones de diseño importantes

- **Checkout como única fuente de verdad**: Orders nunca vuelve a calcular subtotal/envío/IVA/comisión. Si mañana cambia la fórmula de envío multivendedor, solo se toca Checkout.
- **`PedidoVendedor` como entidad de dominio, no un DTO financiero**: se modeló pensando en que Logistics y Payments lo van a extender (estado propio, futuras relaciones), no como una tabla de solo-lectura para reportes.
- **`EstadoPedidoVendedor` es un enum separado de `EstadoPedido`**, aunque hoy tengan los mismos valores — representan entidades de dominio distintas (la compra completa vs. la porción de un vendedor) y se espera que diverjan cuando se implemente el estado global derivado (ver §11).
- **La comisión del vendedor no resta del `totalPedido`**: `totalPedido = subtotal + costoEnvioAsignado` representa la porción del pago del cliente; lo que el vendedor neto recibirá (`subtotal - comisión ± ajustes`) es un cálculo de Payments/Payouts, no de Orders.
- **La idempotencia es el mecanismo principal contra doble envío**, no un lock de base de datos — necesario porque habrá web, móvil, y reintentos automáticos por red que un lock por sí solo no cubre.
- **El repositorio solo consulta Prisma y devuelve modelos Prisma** (sin interfaces de repositorio, sin mapeo manual a entidades), siguiendo la arquitectura ya establecida en el resto del backend.

## 11. Limitaciones conocidas y trabajo futuro

| Limitación | Detalle | Dónde se resolvería |
|---|---|---|
| Sin Payments | No hay Stripe, PaymentIntent, ni webhooks. `Pedido` queda en `PENDIENTE_PAGO` indefinidamente hasta que exista ese módulo | Módulo Payments (nuevo) |
| Sin Logistics | No se genera `Envio`, no hay guías ni tracking. `PedidoVendedor` está preparado para anclar `Envio.pedidoVendedorId` (FK opcional aditivo) cuando ese módulo exista | Módulo Logistics (nuevo) |
| Sin reembolsos | `Reembolso` ya existe en el schema a nivel `Pedido`, pero no hay flujo ni soporte por vendedor | Payments/Logistics |
| Estado global no derivado | `Pedido.estado` se fija en `PENDIENTE_PAGO` al crear y no se recalcula a partir de los `EstadoPedidoVendedor`. La regla de derivación (todos iguales → ese estado; mixtos → `EN_PROCESO`; etc.) está documentada como comentario en el schema pero no implementada | Cuando se construya el motor de transición de estados |
| `IdempotencyKey` no expira | La tabla crece indefinidamente; no hay job de limpieza | Tarea programada que borre registros con `createdAt` > 24h, como hace Stripe |
| Doble-submit con claves distintas | La idempotencia protege reintentos de la *misma* clave. Dos pestañas/dispositivos enviando el mismo carrito con `Idempotency-Key` distintas todavía podrían crear dos pedidos si hay stock suficiente para ambos (el carrito no se bloquea entre la lectura de Checkout y la reserva) | Posible lock optimista sobre `Carrito` o invalidar el carrito al iniciar la preparación |
| Sin pruebas automatizadas | Todo se verificó manualmente (Postman/curl + consultas directas a la base). No hay `.spec.ts` para Orders, consistente con el resto del backend | Suite de tests cuando se defina la estrategia de testing del proyecto |
