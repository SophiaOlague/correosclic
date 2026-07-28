# Módulo Payments

Estado: implementado y probado de extremo a extremo (creación de PaymentIntent, webhook, deduplicación, y los escenarios negativos principales). Payouts, Reembolsos, Logistics y Stripe Connect quedan fuera de este documento porque aún no existen.

## 1. Responsabilidades

- Administrar el ciclo de vida de un pago: crear el `PaymentIntent` en Stripe, mantenerlo sincronizado vía webhooks, y marcar el `Pedido` como `PAGADO` cuando el cobro se confirma.
- **CorreosClic cobra el pedido completo** con Stripe (un solo cargo a la plataforma) — el reparto a vendedores es responsabilidad de un futuro módulo de Payouts, no de este.
- Garantizar que un mismo `Pedido` nunca tenga más de un `PaymentIntent` activo a la vez.
- Garantizar que un mismo intento de pago (reintento de red, doble clic) no dispare una segunda llamada a Stripe.
- Garantizar que los webhooks de Stripe (que pueden llegar duplicados o fuera de orden) nunca hagan retroceder el estado de un pago ni se procesen dos veces.

Explícitamente NO es responsabilidad de este módulo todavía: Payouts a vendedores, reembolsos, generación de guías/tracking, Stripe Connect.

## 2. Estructura de carpetas

```
payments/
├── payments.module.ts
├── application/
│   ├── dto/                  CreatePaymentIntentDto, PaymentIntentResponseDto, PaymentStatusDto
│   └── services/
│       ├── payment-intent.service.ts    crea/reusa PaymentIntent, consulta estado
│       └── webhook-processor.service.ts  dedup + despacho + aplica el nuevo estado
├── controllers/
│   ├── payments.controller.ts           POST /payments/intent (JWT), GET /payments/order/:orderId (JWT)
│   └── payments-webhook.controller.ts   POST /payments/webhooks/stripe (público, firma Stripe)
├── domain/
│   ├── exceptions/            CustomerNotFoundException, OrderNotPayableException,
│   │                          PaymentNotFoundException, InvalidWebhookSignatureException
│   └── services/
│       ├── stripe-status-mapper.ts               PaymentIntent de Stripe -> EstadoPago
│       ├── stripe-payment-method-mapper.ts        tipo/wallet de Stripe -> MetodoPago
│       └── payment-state-transition-policy.ts     grafo de transiciones legales + ESTADOS_PAGO_ACTIVOS
└── infrastructure/
    ├── repositories/
    │   ├── payment.repository.ts        CRUD de Pago + lecturas propias de Pedido/Cliente que necesita el módulo
    │   └── webhook-event.repository.ts   claim atómico de WebhookEvento (dedup)
    └── stripe/
        ├── stripe-client.service.ts             único punto del proyecto que importa el SDK oficial `stripe`
        └── stripe-webhook-verifier.service.ts     constructEvent() con el webhook secret
```

`infrastructure/stripe/` es la única desviación a la convención mandatada (que solo prevé `infrastructure/repositories/`): el cliente de Stripe no es un repositorio, no toca Prisma, así que vive en su propia carpeta hermana.

## 3. Flujo de `POST /payments/intent`

Protegido por `JwtAuthGuard` + `IdempotencyInterceptor` (el mismo interceptor genérico de Orders, reutilizado tal cual). Body: `{ "orderId": "..." }`.

```
1. Resuelve Cliente desde el JWT.
2. Verifica que el pedido exista, sea del cliente, y esté PENDIENTE_PAGO
   -> si no, OrderNotPayableException (400) ANTES de tocar Stripe.
3. Busca un Pago "activo" (PENDIENTE/REQUIERE_ACCION/PROCESANDO) para ese pedido.
   a) Si existe: re-consulta el PaymentIntent en Stripe (retrieve) para obtener
      su client_secret de nuevo (no se persiste, es de un solo uso por respuesta)
      y devuelve el mismo paymentId/paymentIntentId -- NO crea uno nuevo.
   b) Si no existe:
      - Asegura el Customer de Stripe del cliente (lo crea la primera vez con
        una idempotency key determinística `customer:{clienteId}`, lo
        reutiliza siempre después vía Cliente.stripeCustomerId).
      - Convierte el monto a centavos y crea el PaymentIntent en Stripe
        (metadata.pedidoId, automatic_payment_methods habilitado, la
        Idempotency-Key del header se le pasa también a Stripe).
      - Persiste el Pago (estado PENDIENTE).
4. Responde { paymentId, paymentIntentId, clientSecret, status, amount, currency }.
```

Probado con Stripe real (modo test): PaymentIntent creado, Customer creado y reutilizado, y 3 llamadas con distinta Idempotency-Key para el mismo pedido resultaron en 1 solo `Pago`.

## 4. Flujo del webhook (`POST /payments/webhooks/stripe`)

Sin `JwtAuthGuard` a propósito — vive en su **propio controller** (no en `PaymentsController`) para no depender de acordarse de excluir la ruta de un guard aplicado a nivel de clase. La autenticación es la firma HMAC de Stripe.

```
1. main.ts arranca con { rawBody: true } -- Nest captura el buffer crudo en
   request.rawBody ADEMÁS de parsear el body normalmente (no hubo que
   excluir la ruta del parser JSON global, que era el plan original; esta
   forma es la que documenta Nest oficialmente para este caso y es menos
   frágil).
2. StripeWebhookVerifierService.verify(rawBody, signature) -- si la firma no
   valida, InvalidWebhookSignatureException (400) antes de leer el evento.
3. WebhookEventRepository.claim({proveedor:'stripe', eventoId: event.id, ...})
   -- INSERT atómico sobre (proveedor, eventoId). Si ya existe, se responde
   200 sin reprocesar NADA (verificado: reenviar el mismo evento con
   `stripe events resend` no cambia el updatedAt del Pago).
4. Si el evento es de PaymentIntent (created/processing/requires_action/
   succeeded/payment_failed/canceled):
   a. Busca el Pago por stripePaymentIntentId -- si no existe, se ignora
      (log de warning, no es un error).
   b. StripeStatusMapper.map(paymentIntent) -> nuevo EstadoPago (ver #6,
      distingue FALLIDO de PENDIENTE por last_payment_error, no hay un
      status "failed" real en Stripe).
   c. PaymentStateTransitionPolicy.isValidTransition(actual, nuevo) -- si es
      ilegal, se descarta (log de warning).
   d. Si nuevo === EXITOSO: se obtiene el método de pago real (una llamada
      extra a stripe.paymentMethods.retrieve, solo en este caso) para
      guardar metodoPago.
   e. PaymentRepository.updateEstadoSiEsMasReciente(...) -- update atómico
      condicionado por ultimoEventoStripeEn (ver #7). Si nuevo === EXITOSO,
      en la MISMA transacción marca Pedido -> PAGADO + fechaPago.
5. Responde 200.
```

## 5. Flujo de `GET /payments/order/:orderId`

Devuelve el `Pago` más reciente de ese pedido (no solo el activo -- también refleja pagos ya `EXITOSO`, `FALLIDO`, etc.). Ownership por `pedido.clienteId`, `404` genérico si el pedido no existe o no es del cliente (no `403`, mismo criterio que Orders).

## 6. Modelos involucrados

### `Pago` (ya existía en el schema; se le agregaron campos)

| Campo | Rol |
|---|---|
| `stripePaymentIntentId` / `stripeChargeId` | Únicos, nullable. Ancla para deduplicar y para buscar el Pago desde un webhook |
| `stripeIdempotencyKey` | La idempotency key exacta enviada a Stripe al crear el PI (auditoría) |
| `estado` (`EstadoPago`, 7 valores) | `PENDIENTE`, `REQUIERE_ACCION`, `PROCESANDO`, `EXITOSO`, `FALLIDO`, `CANCELADO`, `REEMBOLSADO` |
| `metodoPago` (`MetodoPago`) | `CARD`, `SPEI`, `OXXO`, `APPLE_PAY`, `GOOGLE_PAY`, `OTRO` -- Apple/Google Pay se detectan vía `payment_method.card.wallet.type`, no son un `type` propio de Stripe |
| `monto`, `moneda` | Snapshot del `Pedido.total` al momento de crear el Pago (ver #8) |
| `ultimoEventoStripeEn` | `event.created` de Stripe (no `updatedAt` nuestro) -- guarda contra webhooks fuera de orden |
| `comisionStripe` | Nullable, se llenaría de un evento de settlement -- no implementado todavía |

`pedidoId` **no** tiene `@unique`: un pedido puede tener varios `Pago` en el tiempo (reintentos tras un fallo/cancelación), pero **solo uno activo a la vez**, garantizado por:

```sql
CREATE UNIQUE INDEX pagos_pedido_activo_unique ON pagos("pedidoId")
  WHERE estado IN ('PENDIENTE', 'REQUIERE_ACCION', 'PROCESANDO');
```

Índice único **parcial** -- no representable en el DSL de Prisma, agregado a mano en la migración. Verificado que convive bien con `prisma migrate dev`: Prisma nunca genera un `DROP INDEX` para algo que no declara en `schema.prisma`, así que mientras el `CREATE UNIQUE INDEX` viva dentro de un archivo de migración, sobrevive a `prisma migrate reset` (que reproduce todo el historial) sin problema. El único cuidado real es no correr `prisma db pull` sobre este proyecto sin revisar el diff.

**Nota de implementación real:** Postgres exige que un valor nuevo de enum esté comprometido (en su propia transacción) antes de poder usarse en una expresión (como el `WHERE` de este índice) -- por eso la migración de Payments quedó dividida en dos archivos (`payments_enums` y `payments_active_index`) en vez de uno solo. `prisma migrate deploy` aplica cada migración en su propia transacción, así que la división resuelve el problema sin necesitar SQL más complejo.

### `Cliente.stripeCustomerId` (campo nuevo)

`String? @unique`. Se crea la primera vez que el cliente paga (`PaymentIntentService.ensureStripeCustomer`) y se reutiliza en todos los pagos siguientes. Preparado desde ahora para tarjetas guardadas, mejor señal de riesgo ante Stripe, y conciliaciones -- aunque en esta fase no se usa para nada más que crear el `PaymentIntent`.

### `WebhookEvento` (ya existía en el schema, sin cambios)

`@@unique([proveedor, eventoId])` -- exactamente el mecanismo de deduplicación que Stripe recomienda (chequear `event.id`). Se usó tal cual, sin modificaciones.

## 7. Estrategia de snapshot

`Pago.monto`/`moneda` se capturan **una vez**, del `Pedido.total`, al crear el PaymentIntent -- nunca se recalculan. Mismo principio que ya usa `PedidoItem`: el pago no debe depender de que el pedido cambie después.

## 8. Idempotencia (dos capas)

1. **Nuestro endpoint**: `IdempotencyInterceptor` (el mismo de Orders, sin cambios) envuelve `POST /payments/intent`. Protege contra reintento/doble clic del cliente sobre nuestra API.
2. **La llamada a Stripe**: el mismo valor del header `Idempotency-Key` se le pasa como `idempotencyKey` a `stripe.paymentIntents.create()`. Protege un caso que la capa 1 no cubre: si nuestro backend le pega a Stripe pero la respuesta se pierde (timeout/crash) antes de guardar el `Pago`, un reintento con la misma clave no crea un segundo PaymentIntent -- Stripe devuelve el mismo. Es la razón de usar ambas capas: incluso si nuestra idempotencia local queda en un estado raro por un crash, Stripe sigue protegiendo contra el doble cobro.
3. **Creación del Customer**: usa su propia idempotency key determinística (`customer:{clienteId}`, no la del header) para que un crash a mitad del flujo no duplique el Customer en un reintento posterior.

## 9. Webhooks fuera de orden -- estrategia de dos capas (verificada)

Stripe no garantiza orden de entrega. Protección:

1. **Timestamp del evento** (`event.created`, no la hora en que llegó): `PaymentRepository.updateEstadoSiEsMasReciente` es un `updateMany` condicionado por `ultimoEventoStripeEn` -- update atómico, no lectura-luego-escritura. Un evento más viejo que el ya aplicado se descarta silenciosamente (se loguea, pero `WebhookEvento` igual se marca procesado).
2. **Grafo de transiciones legales** (`PaymentStateTransitionPolicy`), independiente del timestamp:

```
PENDIENTE       → REQUIERE_ACCION, PROCESANDO, EXITOSO, FALLIDO, CANCELADO
REQUIERE_ACCION → PROCESANDO, EXITOSO, FALLIDO, CANCELADO
PROCESANDO      → EXITOSO, FALLIDO, CANCELADO
EXITOSO         → REEMBOLSADO
FALLIDO         → (terminal -- un reintento crea un Pago nuevo, no reabre este)
CANCELADO       → (terminal)
REEMBOLSADO     → (terminal por ahora; REEMBOLSADO_PARCIAL se agregaría aquí)
```

Verificado con pruebas unitarias directas de la política (`PENDIENTE -> EXITOSO` válido, `EXITOSO -> PENDIENTE` inválido, `FALLIDO -> EXITOSO` inválido) y con el ciclo real completo contra Stripe.

## 10. Flujo de cancelación (verificado con Stripe real)

- Se cancela explícitamente (`stripe.paymentIntents.cancel()`, no expuesto por un endpoint propio todavía) o, a futuro, por un job que use `PAYMENT_TIMEOUT_MINUTES` (ya sembrado en `ConfiguracionSistema`, sin consumidor todavía) para cancelar pagos abandonados.
- **Efecto en `Pago`**: pasa a `CANCELADO` (terminal).
- **Efecto en `Pedido`**: ninguno -- se queda en `PENDIENTE_PAGO`. Verificado con un ciclo real: se creó un pedido, se creó y canceló su PaymentIntent, el `Pedido` permaneció `PENDIENTE_PAGO`, y se pudo crear un `Pago` nuevo para el mismo pedido sin ningún código especial (el índice único parcial ya no lo bloqueaba, porque `CANCELADO` no es un estado "activo").

## 11. Escenarios probados contra Stripe real (modo test)

Además del camino feliz (crear → confirmar → webhook → `Pedido` `PAGADO`), se verificaron explícitamente:

| Escenario | Resultado verificado |
|---|---|
| Pagar un pedido ya `PAGADO` | `400 OrderNotPayableException`, antes de tocar Stripe |
| Cancelar un PaymentIntent | `Pago` → `CANCELADO`, `Pedido` sigue `PENDIENTE_PAGO`, reintento crea `Pago` nuevo |
| Tarjeta rechazada (`pm_card_chargeDeclined`) | `Pago` → `FALLIDO` con `mensajeError` real de Stripe, `Pedido` sigue `PENDIENTE_PAGO`, reintento posible |
| 3D Secure (`pm_card_authenticationRequired`) | `Pago` → `REQUIERE_ACCION` |
| Firma de webhook inválida | `400`, sin procesar nada |
| Reenvío manual del mismo evento (`stripe events resend`) | `200`, pero `Pago.updatedAt` no cambia -- cero reprocesamiento |

## 12. Decisiones de diseño importantes

- **Checkout/Orders como única fuente de verdad para el monto**: Payments nunca recalcula subtotal/envío/IVA/comisión, solo lee `Pedido.total`.
- **`EstadoPago` conserva `REEMBOLSADO`** (decisión explícita del usuario): representa el estado del pago dentro del dominio de CorreosClic, no solo el status crudo de Stripe -- un pago exitoso que se reembolsa después debe poder reflejarlo, aunque `Reembolso` siga siendo el registro de detalle/historial.
- **`MetodoPago` es un enum propio**, no un string libre -- consistencia y errores detectados en compilación.
- **El índice único parcial es el mecanismo real** contra "múltiples PaymentIntent activos por pedido" -- la lógica de aplicación (`createOrReuse`) es la experiencia normal, el índice es el respaldo que no puede fallar por una condición de carrera.
- **`StripeClientService` es el único punto que importa el SDK** -- si Payments crece hacia Connect/Transfers, el resto del módulo no se entera.
- **El webhook vive en un controller separado** de `PaymentsController` a propósito, para que no haya manera de "olvidarse" de excluirlo del guard de autenticación.
- **`rawBody: true` en vez de excluir la ruta del parser JSON global** -- terminó siendo más simple que el plan original documentado en el diseño congelado, y es la forma que Nest documenta oficialmente para este caso exacto.

## 13. Limitaciones conocidas y trabajo futuro

| Limitación | Detalle | Dónde se resolvería |
|---|---|---|
| Sin Payouts | El dinero se queda en la cuenta de la plataforma; no hay Transfers a vendedores todavía. El modelo de negocio ("separate charges and transfers") no requiere cambiar nada de Payments cuando Payouts se construya | Módulo Payouts (nuevo), referenciando `LiquidacionVendedor` |
| Sin reembolsos | `Reembolso` existe en el schema a nivel `Pedido`, pero no hay endpoint ni lógica que lo dispare. `EstadoPago.REEMBOLSADO` está listo para reflejarlo cuando exista | Módulo de Reembolsos |
| Sin Stripe Connect | No hay cuentas conectadas de vendedores todavía | Se agregaría cuando exista Payouts, sin tocar `Pago` |
| `comisionStripe` nunca se llena | Requiere un evento/llamada adicional (`balance_transaction` expandido) no implementado | Futuro ajuste al webhook processor |
| Cancelación automática por timeout | `PAYMENT_TIMEOUT_MINUTES` está sembrado pero sin consumidor -- nada cancela pagos abandonados todavía | Job programado (no existe infraestructura de cron en el backend aún) |
| `IdempotencyKey` y `WebhookEvento` no expiran | Ambas tablas crecen indefinidamente, mismo pendiente que se documentó para Orders | Tarea programada de limpieza |
| Doble-submit con claves distintas | Dos pestañas pagando el mismo pedido con `Idempotency-Key` distintas: la segunda reutiliza el `Pago` activo (correcto) gracias al índice parcial, pero no hay lock explícito sobre el pedido durante la ventana de lectura-antes-de-crear | Mismo pendiente documentado para Orders; mitigado en la práctica por el índice único parcial |
| Sin pruebas automatizadas | Todo se verificó manualmente contra la API real de Stripe (modo test) + consultas directas a la base de datos. No hay `.spec.ts` | Suite de tests cuando se defina la estrategia de testing del proyecto |
