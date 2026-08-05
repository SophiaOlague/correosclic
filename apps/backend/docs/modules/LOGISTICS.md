# Módulo Logistics

Estado: implementado y probado de extremo a extremo contra la base de datos real (creación de envíos, recepción, transferencia entre sucursales, asignación de reparto, entrega exitosa y devolución por intentos agotados). Reembolsos, liquidación a vendedores, notificaciones y CRUD administrativo de sucursales/vehículos quedan fuera de este documento porque no existen todavía.

## 1. Responsabilidades

- Crear un `Envio` por cada `PedidoVendedor` en cuanto el pedido queda `PAGADO` (no espera a la recepción física -- ver §10, Opción A).
- Trackear el estado físico del envío end-to-end: recepción en sucursal origen, clasificación, transferencia entre sucursales, llegada a destino, reparto, entrega.
- Registrar un historial de tracking inmutable (`EventoTracking`, append-only) para cada cambio de estado.
- Gestionar la asignación automática de repartidor + vehículo, y los intentos de entrega (incluyendo devolución al remitente tras agotar reintentos).
- **Es el único módulo que escribe `PedidoVendedor.estado`** a partir de `PAGADO` -- ni Orders ni Payments lo tocan (gap heredado de Orders, cerrado aquí).
- Exponer tracking de solo lectura al cliente/vendedor, y endpoints operativos para empleados de sucursal y repartidores.

Explícitamente NO es responsabilidad de este módulo: recalcular el costo de envío cobrado al cliente (ya congelado en `PedidoVendedor.costoEnvioAsignado` desde Checkout/Orders), reembolsos, liquidación a vendedores, notificaciones push, CRUD administrativo de `Sucursal`/`Empleado`/`Repartidor`/`Vehiculo` (se siembran directo en base de datos, ver `prisma/seed/logistics.seed.ts`).

## 2. Estructura de carpetas

```
logistics/
├── logistics.module.ts
├── application/
│   ├── dto/                    ConfirmReceptionDto, RecordDeliveryAttemptDto,
│   │                            ShipmentResponseDto (+ mapper), ShipmentSummaryDto
│   ├── interfaces/              RoutingPlan / DeliveryAssignmentPlan / DeliveryOutcomePlan
│   └── services/
│       ├── logistics-planning.engine.ts        el motor por fases -- ver §5
│       ├── logistics-orchestrator.service.ts   único punto de control del flujo -- ver §5
│       ├── shipment-creation.service.ts        crea un Envio por PedidoVendedor al pagarse
│       └── order-ready-for-fulfillment.listener.ts  único listener del único evento entre módulos
├── controllers/
│   ├── shipment-tracking.controller.ts   GET de tracking (cliente/vendedor)
│   ├── reception.controller.ts           POST /logistics/reception (recepcionista)
│   ├── transfer.controller.ts            POST /logistics/transfers/:id/arrival (empleado destino)
│   ├── delivery.controller.ts            GET/POST de reparto (repartidor)
│   └── logistics-ops.controller.ts       colas operativas + reintento manual de planificación
├── domain/
│   ├── exceptions/    ShipmentNotFoundException, InvalidShipmentTransitionException,
│   │                  InvalidShipmentPhaseException, NoBranchAvailableException
│   └── services/      policies puras -- ver §5 (todas con su .spec.ts)
└── infrastructure/
    └── repositories/
        ├── shipment.repository.ts   ciclo de vida completo del Envio (Prisma únicamente)
        ├── branch.repository.ts     lecturas de Sucursal/Vehiculo/Empleado
        └── courier.repository.ts    candidatos de reparto (Repartidor + AsignacionVehiculo vigente)
```

`HaversineDistanceCalculator` vive en `src/shared/geo/` (extraída de Checkout, que también la usa) y `OrderReadyForFulfillmentEvent` en `src/shared/events/` -- son los dos únicos puntos compartidos con otros módulos.

## 3. El motor de planificación (`LogisticsPlanningEngine`)

Es el corazón del módulo. Sigue un patrón de tres fases, cada una con:

1. Una **precondición de estado explícita** (verificada en tiempo de ejecución, lanza `InvalidShipmentPhaseException` si no se cumple).
2. Un **tipo de retorno propio** (`RoutingPlan` / `DeliveryAssignmentPlan` / `DeliveryOutcomePlan`) que estructuralmente no puede producir la decisión de otra fase.

```
planClassificationAndRoutingPhase(envio)     precondición: RECIBIDO_SUCURSAL o CLASIFICADO (reintento)
  -> usa RouteResolver (¿origen == destino?) + VehicleCapacityPolicy (vehículo en sucursal origen)
  -> RoutingPlan: SIN_TRANSFERENCIA | CREAR_TRANSFERENCIA{vehiculoId} | ESPERAR_VEHICULO

planDeliveryAssignmentPhase(envio)           precondición: EN_SUCURSAL_DESTINO
  -> único punto de entrada de DeliveryAssignmentPolicy
  -> DeliveryAssignmentPlan: ASIGNAR{repartidorId, vehiculoId} | ESPERAR_DISPONIBILIDAD

planRetryOrReturnPhase(intento)              precondición: EN_REPARTO
  -> usa DeliveryRetryPolicy + ConfiguracionSistema.MAX_DELIVERY_ATTEMPTS
  -> DeliveryOutcomePlan: ENTREGADO | REINTENTAR | DEVOLVER
```

`LogisticsOrchestratorService` es el único que llama al engine y el único que persiste (vía `ShipmentRepository`). No hay listeners intramódulo: cuando el resultado de una fase permite continuar sin esperar otro hecho físico (ej. envío sin transferencia), el Orchestrator llama a la siguiente fase **en el mismo método**, de forma explícita y secuencial -- verificado en la prueba end-to-end (ver §8).

## 4. Flujo completo (`PAGADO` -> `ENTREGADO`)

```
Pedido.estado -> PAGADO (Payments)
  │  emite OrderReadyForFulfillmentEvent (único evento entre módulos)
  ▼
OrderReadyForFulfillmentListener -> ShipmentCreationService
  │  por cada PedidoVendedor: resuelve sucursalOrigen (más cercana al Vendedor.estadoOperacion)
  │  y sucursalDestino (más cercana a Pedido.direccionEntrega) por Haversine,
  │  genera trackingInterno, crea Envio en PENDIENTE_RECEPCION
  ▼
Recepcionista escanea la guía -> POST /logistics/reception
  │  certifica el hecho físico -- no decide nada
  │  Orchestrator.confirmReception: RECIBIDO_SUCURSAL, luego llama al engine
  ▼
planClassificationAndRoutingPhase
  ├─ SIN_TRANSFERENCIA (misma sucursal) ──────────────┐
  │  CLASIFICADO -> EN_SUCURSAL_DESTINO               │ encadenado explícito,
  │                                                     │ mismo request
  └─ CREAR_TRANSFERENCIA ─┐                            │
     CLASIFICADO -> EN_TRANSITO                        │
     (crea TransferenciaSucursal con vehiculoId)        │
     │                                                  │
     │  Empleado en sucursal destino confirma llegada  │
     │  POST /logistics/transfers/:id/arrival           │
     └─> EN_SUCURSAL_DESTINO ────────────────────────────┘
                                                          ▼
                                    planDeliveryAssignmentPhase
                                    ASIGNAR -> crea Entrega, EN_REPARTO
                                    (ESPERAR_DISPONIBILIDAD si no hay candidato)
                                                          ▼
                          Repartidor registra intento -> POST /logistics/deliveries/:id/attempts
                          ├─ EXITOSO -> ENTREGADO (terminal)
                          ├─ fallido, intentos < máximo -> REINTENTAR (se queda EN_REPARTO)
                          └─ fallido, intentos >= máximo -> DEVOLVER -> DEVUELTO (terminal)
```

Si una fase queda en `ESPERAR_VEHICULO`/`ESPERAR_DISPONIBILIDAD` (sin recurso disponible), no hay reintento automático en v1 -- un empleado de la sucursal correspondiente lo reintenta manualmente vía `POST /logistics/shipments/:id/retry-planning`.

## 5. Modelos involucrados

### `Envio`

Ancla a `PedidoVendedor` mediante `pedidoVendedorId` (FK única -- reemplaza los `pedidoId`+`vendedorId` originales del schema, ver §10a). Nace en `PENDIENTE_RECEPCION` con `sucursalOrigenId`/`sucursalDestinoId` ya resueltos y `distanciaKm` calculado; `pesoRealKg`/`pesoCobrableKg` se llenan hasta que el recepcionista pesa el paquete (v1: sin cálculo volumétrico, `pesoCobrableKg = pesoRealKg`). `trackingOficial`, `costoEnvio`, `zonaTarifariaId`/`tarifaEnvioId` y `fechaEntregaEstimada` quedan sin usar en v1 (no hay integración con paquetería externa ni modelo de costeo operativo todavía).

### `EventoTracking`

Append-only. Cada transición de `Envio.estado` inserta una fila nueva con una descripción en español pensada para mostrarse al cliente tal cual (`DESCRIPCION_POR_ESTADO` en `shipment.repository.ts`).

### `TransferenciaSucursal`

Un salto directo por transferencia en v1 (sin hubs intermedios). `vehiculoId` es requerido -- se resuelve entre los vehículos activos de la sucursal de **origen** con capacidad suficiente (`VehicleCapacityPolicy`). `fechaSalida` la estampa el sistema al crear la fila (no hay certificación humana de salida en v1, solo de llegada).

### `Entrega` / `IntentoEntrega`

Un `Entrega` por `Envio` (1:1, `@unique envioId`). `IntentoEntrega.numeroIntento` se calcula dentro de la misma transacción que lo inserta (`count + 1`), nunca confiado al cliente HTTP.

## 6. Endpoints

| Método | Ruta | Actor | Descripción |
|---|---|---|---|
| GET | `/logistics/orders/:pedidoId/shipments` | Cliente | Envíos de su pedido (uno por vendedor) |
| GET | `/logistics/vendors/me/pending-shipments` | Vendedor | Envíos que aún debe llevar a sucursal |
| GET | `/logistics/shipments/:id` | Cliente dueño \| Vendedor dueño | Detalle + historial completo |
| POST | `/logistics/reception` | Empleado (recepcionista) | Certifica recepción -- `{trackingInterno, observaciones?, pesoRealKg?}` |
| POST | `/logistics/transfers/:id/arrival` | Empleado (sucursal destino) | Certifica llegada de una transferencia |
| GET | `/logistics/couriers/me/deliveries` | Repartidor | Sus entregas activas |
| POST | `/logistics/deliveries/:entregaId/attempts` | Repartidor dueño | Registra un intento -- `{resultado, observaciones?, fotoIntentoUrl?, nombreRecibe?}` |
| GET | `/logistics/branches/:sucursalId/reception-queue` | Empleado de esa sucursal | Envíos `PENDIENTE_RECEPCION` esperados |
| GET | `/logistics/branches/:sucursalId/dispatch-queue` | Empleado de esa sucursal | Envíos `CLASIFICADO` listos para transferir |
| POST | `/logistics/shipments/:id/retry-planning` | Empleado de la sucursal correspondiente | Reintenta la fase que quedó en espera |

Todos protegidos por `JwtAuthGuard`. El ownership se resuelve por pertenencia real (¿este `usuarioId` es un `Empleado` de esa sucursal? ¿un `Repartidor` dueño de esa `Entrega`? ¿un `Cliente`/`Vendedor` dueño de ese recurso?), nunca por un campo "rol" declarado -- mismo criterio que Orders: si no coincide, `404`, no `403`.

## 7. Decisiones de diseño importantes

- **El `Envio` nace en `PAGADO`, no en la recepción física** (Opción A): el recepcionista *escanea* una guía que ya existe, no la genera. Esto también deja visible el caso "vendedor que cobra pero nunca entrega en sucursal" (`PENDIENTE_RECEPCION` indefinido), base para un futuro SLA.
- **`OrderReadyForFulfillmentEvent` es el único acoplamiento entre módulos**: nombrado por la intención de dominio ("el pedido ya puede surtirse"), no por el mecanismo de cobro ni por quién lo escucha. Todo lo demás dentro de Logistics es llamada directa de método -- el Orchestrator nunca delega el control a un listener intramódulo.
- **Separación de fases del motor a propósito estricta**: `DeliveryAssignmentPolicy` es alcanzable únicamente desde `planDeliveryAssignmentPhase`, con guarda de estado tanto en el tipo de retorno como en tiempo de ejecución -- imposible asignar un repartidor antes de que el envío llegue a su sucursal destino, incluso por error de programación futuro.
- **`sucursalOrigenId`/`sucursalDestinoId` se resuelven dinámicamente por Haversine** (no hay relación `Vendedor -> Sucursal` en el schema): reutiliza `HaversineDistanceCalculator`, extraída a `shared/geo/` para no duplicar la que ya usaba Checkout.
- **Vehículo de transferencia troncal, no solo de última milla**: `TransferenciaSucursal.vehiculoId` (migración aditiva) permite auditar qué vehículo hizo cada tramo, no solo el de reparto final.
- **Estados excepcionales dedicados** (`EXTRAVIADO`, `DANADO`) en vez de reutilizar `CANCELADO`: representan hechos de dominio distintos con consecuencias futuras distintas (investigación, reembolso, métricas).
- **El repositorio solo consulta Prisma y compone transacciones completas por operación de negocio** (igual que Orders/Payments): cada método público de `ShipmentRepository` es una unidad transaccional propia: guarda condicionada + entidad hija + `EventoTracking`, sin exponer el cliente de transacción a la capa de aplicación.

## 8. Verificación end-to-end realizada

Contra la base de datos de desarrollo real (seed en `prisma/seed/logistics.seed.ts`: 2 sucursales -- Durango y Guadalajara --, 3 empleados, 1 repartidor con vehículo asignado), usando un pedido ya `PAGADO` con 3 `PedidoVendedor`:

- ✅ Creación de 3 `Envio` (uno por vendedor), idempotente ante una segunda invocación.
- ✅ Camino sin transferencia (vendedor en Durango, destino en Durango): cadena completa `PENDIENTE_RECEPCION -> ... -> EN_REPARTO` en un solo request.
- ✅ Camino con transferencia (vendedor en Guadalajara, destino en Durango): se detiene correctamente en `EN_TRANSITO` -- no asigna repartidor antes de tiempo.
- ✅ Confirmación de llegada de transferencia -> encadena asignación de reparto automáticamente.
- ✅ Guard de ownership: recepcionista de una sucursal no puede confirmar la recepción ni la llegada de un envío que no le corresponde (`404`).
- ✅ Doble confirmación de recepción rechazada (`409`).
- ✅ Entrega exitosa al primer intento -> `ENTREGADO`.
- ✅ Tres intentos fallidos consecutivos (con `MAX_DELIVERY_ATTEMPTS=3` real desde `ConfiguracionSistema`) -> `DEVUELTO` automático en el tercero.
- ✅ Validación de DTO (`400` con body inválido).
- ✅ `retry-planning` sobre un envío en estado terminal rechazado (`409`).

## 9. Limitaciones conocidas y trabajo futuro

| Limitación | Detalle | Dónde se resolvería |
|---|---|---|
| Sin CRUD administrativo | `Sucursal`/`Empleado`/`Repartidor`/`Vehiculo` se siembran directo en base de datos | Módulo de administración (futuro) |
| Sin reintento automático de planificación | `ESPERAR_VEHICULO`/`ESPERAR_DISPONIBILIDAD` requieren un reintento manual vía endpoint -- no hay cron ni cola | Job programado (`@nestjs/schedule`) cuando haga falta |
| Un salto por transferencia | No hay ruteo por hubs intermedios; el schema lo soportaría (`TransferenciaSucursal` no es única por `envioId`) pero el motor no lo decide | Extender `RouteResolver` cuando exista red real de sucursales |
| Sin peso volumétrico | `pesoCobrableKg = pesoRealKg` siempre; no se calcula desde dimensiones del paquete | Cuando se defina cómo medir dimensiones en la recepción |
| Un `Envio` por `PedidoVendedor` | Sin envíos parciales/split shipments | Si el negocio lo requiere, permitiría múltiples `Envio` por `PedidoVendedor` |
| Derivación de `Pedido.estado` | Sigue sin implementarse (gap heredado de Orders): `PedidoVendedor.estado` ya avanza correctamente, pero nadie agrega esos estados hacia `Pedido.estado` | Motor de derivación (pendiente desde Orders) |
| Sin pruebas automatizadas de application/infrastructure | Las policies puras de `domain/` sí tienen `.spec.ts` (34 pruebas); `LogisticsPlanningEngine`, `LogisticsOrchestratorService` y los repositorios se verificaron manualmente end-to-end, consistente con el resto del backend | Suite de integración cuando se defina la estrategia de testing del proyecto |
