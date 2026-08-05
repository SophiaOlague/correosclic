# Integraciones pendientes — frontend-web

Registro de las pantallas cuyo backend todavía no existe y de los contratos que
harían falta para conectarlas. Se actualiza al cerrar cada módulo.

**Última actualización:** 2026-08-04 (cierre del Módulo 9 — Admin; **fin de la
integración**: ya no queda ninguna pantalla del export de Figma)

> **Carrito integrado.** `/cart` es el primer módulo enteramente conectado a la
> API. Para que el flujo funcione de punta a punta pese a que el catálogo sigue
> siendo local, `src/mocks/catalog.mock.ts` se regeneró **volcando la base de
> datos sembrada**: cada `variantes[].id` del mock es un `productoVarianteId`
> real, así que `POST /cart/items` lo acepta. Al conectar los GET de catálogo,
> el mock desaparece sin tocar nada más.

> El inventario de endpoints **reales** del backend se levantó leyendo los
> controladores de `apps/backend/src`. Ninguna pantalla debe llamar a un
> endpoint que no aparezca ahí.

---

## 0. Auth — lo que el diseño ofrece y el backend no

El módulo Auth quedó integrado (`POST /auth/login`, `POST /auth/register`,
`GET /auth/ping`). Estas tres piezas del diseño **no tienen respaldo** y se
resuelven hoy con un aviso al usuario:

| Elemento del diseño | Endpoint esperado | Estado |
| --- | --- | --- |
| "¿Olvidaste tu contraseña?" | `POST /auth/forgot-password` + `POST /auth/reset-password` | Muestra aviso "próximamente" |
| Botones Google / Apple | OAuth (`GET /auth/oauth/:provider`) | Muestran aviso "próximamente" |
| Sesión larga / renovación | `POST /auth/refresh` | No existe refresh token: el JWT dura 1 día y al expirar se cierra la sesión |

### ⚠️ Defecto del backend detectado (sin corregir)

`EmailAlreadyExistsException` y `PasswordMismatchException`
(`apps/backend/src/auth/domain/exceptions/`) extienden `Error` en vez de una
excepción HTTP de NestJS. El filtro por defecto las convierte en **500 Internal
Server Error**, así que registrarse con un correo ya existente devuelve un 500
en lugar de un 409 con su mensaje.

Todos los demás módulos sí lo hacen bien (`OrderNotFoundException extends
NotFoundException`, `OrderStockConflictException extends ConflictException`).

La corrección sería cambiar la clase base a `ConflictException` y
`BadRequestException` respectivamente. **No se aplicó** porque el alcance
autorizado para el backend se limitaba a `JwtStrategy`. Mientras tanto, el
cliente HTTP traduce cualquier 5xx a un mensaje genérico en español para no
enseñar "Internal server error" al usuario.

---

## 0b. Payments — lo integrado y lo que falta

`POST /payments/intent` y `GET /payments/order/:orderId` quedaron integrados en
`/pago/:orderId`. El webhook del backend es la autoridad: la interfaz nunca da
un pago por bueno con la respuesta del SDK de Stripe.

| Elemento | Estado |
| --- | --- |
| Tarjeta | ✅ Integrado con Stripe Payment Element |
| OXXO, SPEI, Apple Pay, Google Pay | Soportados por el dominio (`MetodoPago`) pero **no expuestos** en el frontend por decisión de alcance. Son asíncronos y el diseño no contempla la espera |
| Seguimiento tras el pago | Pendiente del Módulo 7 (Logistics). La pantalla de confirmación **no muestra transportista ni fecha estimada**: Orders no los devuelve |

### ✅ Consistencia del agregado al confirmarse el pago

Se detectó que, tras un pago exitoso, `Pedido.estado` pasaba a `PAGADO` pero
`PedidoVendedor.estado` se quedaba en `PENDIENTE_PAGO`: el detalle mostraba
"Pagado" en la cabecera y "Pendiente de pago" en cada vendedor.

**Corregido en Payments** (`payment.repository.ts`), no en Logistics: el cambio
lo provoca el webhook de Stripe, así que es Payments quien debe dejar el
agregado de Orders consistente **antes** de emitir `OrderReadyForFulfillmentEvent`.
Logistics solo consume ese evento para iniciar el fulfillment y no toca estados
de pago.

Dentro de la misma transacción que ya marcaba el pedido, ahora también se
mueven todos sus `PedidoVendedor` que sigan en `PENDIENTE_PAGO`. Se acota a ese
estado para no revivir a un vendedor cancelado, y un pago fallido no mueve
nada.

---

## 0c. Logistics — lo integrado y lo que falta

Los 10 endpoints reales quedaron integrados, más uno nuevo autorizado. El
motor de planificación es la autoridad: la interfaz **certifica hechos físicos
y muestra estados**, nunca elige ruta, vehículo ni repartidor.

| Pantalla | Ruta | Endpoints |
| --- | --- | --- |
| Envíos dentro del pedido | `/mis-pedidos/:id` | `GET /logistics/orders/:pedidoId/shipments` |
| Detalle y tracking | `/envio/:id` | `GET /logistics/shipments/:id` |
| Envíos del vendedor | `/vendedor/envios` | `GET /logistics/vendors/me/pending-shipments` |
| Panel de recepción | `/recepcion` | `GET /logistics/branches/me`, `.../reception-queue`, `.../dispatch-queue`, `POST /logistics/reception`, `POST /logistics/shipments/:id/retry-planning`, `POST /logistics/transfers/:id/arrival` |
| Panel del repartidor | `/repartidor` | `GET /logistics/couriers/me/deliveries`, `POST /logistics/deliveries/:entregaId/attempts` |

### ✅ Cambios de backend autorizados en este módulo

Cuatro commits independientes del frontend, todos aprobados antes de tocar nada:

1. **`GET /logistics/branches/me`** — sin él, las tres rutas que reciben
   `sucursalId` en la ruta eran inalcanzables: `AuthenticatedUserDto` no trae la
   adscripción a sucursal y ningún endpoint devolvía el `Empleado`.

   **Decisión de diseño confirmada:** `AuthenticatedUserDto` se mantiene
   acotado a identidad y autorización (`id`, `email`, nombre, `roles`), y el
   contexto operativo del empleado —sucursal, `empleadoId`, puesto— vive dentro
   del dominio de Logistics. Añadirlo al DTO de sesión habría obligado a
   `JwtStrategy` a resolver un `Empleado` en **cada petición autenticada del
   sistema**, incluidos los usuarios que nunca tocan Logistics. Por eso el
   frontend obtiene ese contexto con `GET /logistics/branches/me`
   (`useMyBranch`), que es la primera consulta del panel de recepción y la que
   provee el `sucursalId` a las colas y al reintento de planificación.
2. **Resultados de recepción** — `ConfirmReceptionDto` acepta
   `resultado?: ACEPTADO | DANADO | RECHAZADO` (omitirlo equivale a `ACEPTADO`,
   así que el flujo anterior no cambia) con `observaciones` obligatorias cuando
   no es `ACEPTADO`. Nueva fase `planReceptionOutcomePhase` en el motor, que es
   además donde por fin se **inyecta `ShipmentStateTransitionPolicy`**: estaba
   registrada como provider pero no participaba en ninguna validación.
   Transiciones: `PENDIENTE_RECEPCION → DANADO` (arista nueva en el grafo) y
   `PENDIENTE_RECEPCION → CANCELADO` (ya declarada). Ninguna de las dos pasa por
   `RECIBIDO_SUCURSAL` ni encadena clasificación: el paquete no entra a la red.
   `DEVUELTO` queda reservado para lo que sí inició su ciclo y regresó.
3. **Ownership del repartidor y DTO ampliado** — `GET /logistics/shipments/:id`
   admite al repartidor con la entrega asignada (antes le respondía 404), y
   `ShipmentResponseDto` expone `entrega.intentos[]` y `transferencias[]`. Antes
   `intentos` era solo un contador —el historial de intentos no salía del
   backend— y sin `transferencias[]` no había forma de obtener el
   `transferenciaId` que exige `POST /logistics/transfers/:id/arrival`, que era
   por tanto inalcanzable desde cualquier interfaz.
4. **Semilla** (`packages/database`) — `logistics.seed.ts` creaba empleados y
   repartidor sin asignarles `UsuarioRol`. Los endpoints funcionaban porque
   validan contra `Empleado`/`Repartidor`, pero `RoleRoute` dejaba al
   recepcionista y al repartidor fuera de su propio panel.

5. **Cierre de la entrega tras una devolución** —
   `findActiveEntregasByRepartidorId` decidía qué entregas siguen abiertas con
   `fechaEntrega: null`, pero esa fecha **solo se escribe cuando el paquete se
   entrega**. Al agotarse los intentos, el envío pasaba a `DEVUELTO` y la
   entrega se quedaba para siempre en "mis entregas asignadas".

   Se corrigió el predicado en vez de escribir la fecha: rellenar
   `fechaEntrega` en una devolución sería un dato falso —ese paquete nunca se
   entregó— y solo habría tapado ese caso, dejando colgadas las entregas cuyo
   envío acabe en `CANCELADO` o `EXTRAVIADO`. Ahora la consulta filtra por
   `envio.estado === EN_REPARTO`, que es lo que el dominio mantiene de verdad
   vía `ShipmentStateTransitionPolicy` y coincide exactamente con la fase en la
   que `recordDeliveryAttempt` acepta un intento. El envío devuelto sigue
   siendo consultable por el repartidor en `GET /logistics/shipments/:id`: el
   ownership depende de `Entrega.repartidorId`, no de esta lista.

### ⚠️ Defectos del backend detectados y **no** corregidos

| Punto | Detalle |
| --- | --- |
| Colas sin DTO | `reception-queue` y `dispatch-queue` devuelven el registro `Envio` de Prisma tal cual: sin número de pedido, cliente ni vendedor, y con los `Decimal` serializados como cadena. Por eso la tabla del panel de recepción tiene menos columnas que el diseño de Figma. |
| Empleado sin acceso al detalle | El ownership de `GET /logistics/shipments/:id` cubre cliente, vendedor y repartidor, pero **no al empleado de sucursal**: al recepcionista le responde 404. El panel esquiva el hueco usando el `ShipmentResponseDto` que ya devuelve el propio `POST /logistics/reception`. |
| `fechaEntregaEstimada` nunca se escribe | La columna existe y el DTO la devuelve, pero ningún servicio la calcula: siempre es `null`. La interfaz solo la muestra si llega con valor, así que hoy no aparece. |

### Elementos del diseño sin respaldo

| Elemento del diseño | Realidad del contrato | Resolución |
| --- | --- | --- |
| Mapa con ruta, distancia al siguiente destino y ETA | No hay modelo de rutas de reparto ni coordenadas de entrega | Se sustituye por la lista de entregas asignadas y el detalle real del envío |
| Fotografía de evidencia (recepción y entrega) | `fotoIntentoUrl` se acepta en el DTO, pero no hay endpoint de subida de archivos (`POST /storage/test` no lo es) | La interfaz **muestra** la evidencia si existe, pero no permite capturarla |
| Firma del destinatario | No existe en el esquema | Eliminado |
| KPIs del turno, incidencias, historial de recepciones | No hay agregados ni endpoint de historial por sucursal | Eliminados; el panel muestra las dos colas reales |
| Guía "Correos de México" (`MX-…`) | Solo existe `trackingInterno` (`ENV-…`) | Se muestra únicamente la guía real |
| Checklist de 6 verificaciones | No se persiste en ningún modelo | Se conserva como control local previo a certificar: habilita "Confirmar recepción" o deriva a "Registrar incidencia" |
| Lista global "mis envíos" del cliente | Solo existe por pedido | `/rastreo` redirige a "Mis pedidos" |
| Selector de estado del repartidor (Disponible / En ruta) | No existe en el esquema | Eliminado |

---

## 0d. Seller — lo integrado y lo que falta

El dominio Seller era **casi todo escritura**: no existía ni una sola lectura
del lado del vendedor. Se añadieron cinco, se cerraron cuatro defectos de
seguridad y se corrigió el significado del paso `REVISION`.

| Pantalla | Ruta | Endpoints |
| --- | --- | --- |
| Onboarding (3 pasos) | `/vender` | `GET /seller/requests/me`, `POST /seller/requests`, `.../fiscal-information`, `.../documents`, `PATCH .../submit`, `POST /storage/uploads` |
| Panel y "Mis productos" | `/vendedor` | `GET /seller/store`, `POST /seller/store`, `GET /seller/products` |
| Alta de producto | `/vendedor/productos/nuevo` | `GET /catalog/categories`, `POST /seller/products` |
| Ficha del producto | `/vendedor/productos/:id` | `GET /seller/products/:id`, `POST .../variants`, `POST|PATCH .../variants/:id/inventory`, `POST .../images`, `PATCH .../publication`, `GET /catalog/attributes[/:id/values]` |

### 🔒 Defectos de seguridad corregidos

Cada uno en su propio commit, todos aprobados antes de tocar nada:

1. **IDOR en el onboarding** — `addFiscalInformation`, `addDocument` y
   `submitRequest` recibían el `requestId` por URL y **no comprobaban
   propiedad**: cualquier usuario autenticado podía escribir el RFC y la razón
   social de otra persona, subirle documentos y enviar su solicitud. Ahora se
   resuelve el `Cliente` del usuario y se responde 404 si no es suya.
2. **Inventario sin ownership** — los endpoints de `variants/:id/inventory` no
   validaban nada y `create`/`update` ni siquiera recibían el usuario:
   cualquiera podía dejar en cero el stock de cualquier vendedor.
3. **`reserve` / `release` / `confirm` retirados de HTTP** — primitivas
   internas sin consumidor legítimo (Orders reserva en su propia transacción,
   `order.repository.ts`). Los métodos siguen en `InventoryService`.
4. **Admin sin guard de rol** — `admin/seller-requests` solo llevaba
   `JwtAuthGuard`: cualquiera podía leer la PII de todos los solicitantes y
   **auto-aprobarse como VENDEDOR**. Se creó la infraestructura que faltaba
   (`@Roles` + `RolesGuard`) y se restringió a `SUPER_ADMIN`. Es una decisión
   de menor privilegio: si en el Módulo 9 un `ADMIN_REGIONAL` debe revisar
   solicitudes, se amplía el decorador entonces.
5. **`POST /storage/test` sin autenticación** — subía archivos arbitrarios a R2
   sin sesión. Ahora es `POST /storage/uploads`, con JWT y validación de tipo y
   tamaño. Es el upload que usa el onboarding para los documentos.

### ✅ Lecturas y reglas añadidas

- `GET /seller/requests/me` — **la pieza que desbloqueaba el módulo**. Sin ella
  se perdía el `requestId` al recargar y `POST /seller/requests` respondía 409
  por la solicitud pendiente, dejando al usuario sin salida.
- `GET /seller/store`, `GET /catalog/categories`, `GET /seller/products` y
  `GET /seller/products/:id`.
- `PATCH /seller/products/:id/publication` — `Producto.publicado` nacía en
  `false` y **nada lo actualizaba**, mientras el carrito rechaza lo no
  publicado: un producto creado por la API no podía venderse nunca. Publicar
  exige ahora una variante activa con inventario y stock
  (`ProductPublicationPolicy`, con pruebas); retirar de publicación no se
  valida.
- **Significado de `REVISION`** — `addDocument` lo ponía al subir el tercer
  documento, el mismo valor que escribe `submitRequest`. Nada distinguía
  "expediente completo" de "enviada", así que el paso de envío era inalcanzable
  y **la cola del administrador listaba solicitudes que su dueño seguía
  llenando**. Ahora solo `submitRequest` lo escribe.
- `ParseUUIDPipe` en las rutas de `seller/` y `catalog/`: un id malformado
  respondía 500 y ahora responde 400.

### Elementos del diseño sin respaldo

| Elemento del diseño | Realidad del contrato | Resolución |
| --- | --- | --- |
| Formulario de una página con teléfono, correo de soporte, dirección fiscal, categoría y logotipo | `SolicitudVendedor` solo modela RFC, razón social y régimen fiscal, más tres documentos obligatorios que el diseño omitía | Asistente de 3 pasos dirigido por `pasoActual`; los campos sin respaldo se omiten |
| "Simulador de Estados (Dev Only)" | — | Eliminado: los estados son reales |
| KPIs de ventas, gráfica de ingresos, últimos pedidos, clientes | No hay endpoints de métricas ni de pedidos por vendedor | Eliminados; el panel muestra la tienda y el catálogo |
| Precio de comparación y marca en el producto | No existen en `Producto`; el precio vive en la variante | Eliminados |
| Eliminar producto | No hay endpoint de borrado | La tabla no ofrece la acción |
| Aviso por correo al resolverse la solicitud | No hay módulo de notificaciones | Se indica que puede volver a consultar la página |
| Logotipo de la tienda | `Tienda.logoUrl` existe pero no hay endpoint que lo escriba | Se muestra si viene; no se puede capturar |

### ⚠️ Pendientes conocidos

| Punto | Detalle |
| --- | --- |
| Alta de producto no transaccional | Producto, variante, inventario e imágenes son llamadas separadas y el backend no las agrupa. Si falla el inventario, la variante queda creada sin stock; la interfaz lo dice explícitamente y permite corregirlo desde la ficha en vez de fingir atomicidad. |
| Información fiscal no editable | `addFiscalInformation` responde 409 si ya existe y no hay PATCH. Tras un rechazo hay que iniciar una solicitud nueva y recapturarlo todo. |
| Sin edición de producto | No existe `PATCH /seller/products/:id`: nombre, descripción, categoría y peso no se pueden corregir tras el alta. |
| `ADMIN_LOCAL` y `ADMIN_REGIONAL` sin acceso | Por menor privilegio, la revisión de solicitudes es solo de `SUPER_ADMIN`. A decidir en el Módulo 9. |

---

## 0e. Admin — lo integrado y lo que falta

De las 39 secciones que el diseño repartía entre tres paneles administrativos,
**solo cuatro tienen backend**. Las otras 35 —KPIs, gráficas, reportes,
auditoría, usuarios, empleados, regiones, incidencias, pedidos y envíos
globales— se eliminaron en vez de conservarse con datos de ejemplo: eran
controles sin ningún endpoint detrás.

| Pantalla | Ruta | Endpoints |
| --- | --- | --- |
| Cola de revisión | `/admin/solicitudes` | `GET /admin/seller-requests` |
| Expediente y resolución | `/admin/solicitudes/:id` | `GET /admin/seller-requests/:id`, `GET /admin/operating-states`, `PATCH .../approve`, `PATCH .../reject` |
| Sucursales | `/admin/sucursales` | `GET /admin/branches` |
| Vehículos | `/admin/vehiculos` | `GET /admin/vehicles` |
| Configuración | `/admin/configuracion` | `GET /admin/system-config`, `PATCH /admin/system-config/:clave` |

El panel vive en una **raíz propia del router**, fuera de `RootLayout`: es un
dashboard a pantalla completa con sidebar oscuro y barra superior propia, así
que `AdminLayout` asume el título del documento, el `<Suspense>` de las rutas
diferidas y el vigilante de caducidad de sesión.

### Estado de operación obligatorio al aprobar

`PATCH /admin/seller-requests/:id/approve` exige `estadoOperacionId` y el
formulario no ofrece forma de omitirlo. No es un dato administrativo cualquiera:
`ShipmentCreationService` toma las coordenadas de ese estado para resolver la
sucursal de origen de cada envío, y un `Vendedor` sin él deja sus pedidos
pagados **sin guía y en silencio** (el backend solo lo registraba con un
`logger.warn`). El selector se alimenta de `GET /admin/operating-states`, que
ya filtra por estado activo **y con coordenadas**.

### Sin jerarquía de roles: solo `SUPER_ADMIN`

Los nueve endpoints de `admin/` llevan `@Roles(SUPER_ADMIN)`. Por eso
`landingRouteFor` manda a `ADMIN_REGIONAL` y `ADMIN_LOCAL` a `/mi-cuenta` y no
al panel: no tienen ninguna funcionalidad propia todavía y `/admin/solicitudes`
les respondería 403. Se actualizará cuando existan sus dashboards.

### ⚠️ Tres claves de configuración sin consumidor

`ConfiguracionSistemaKey` declara siete claves, pero solo cuatro las lee alguien
hoy: `MARKETPLACE_COMMISSION` e `IVA_PERCENTAGE` (`CheckoutService`),
`ADDITIONAL_VENDOR_SHIPPING_FACTOR` (`ShippingCalculatorService`) y
`MAX_DELIVERY_ATTEMPTS` (`LogisticsPlanningEngine`).

`VOLUMETRIC_FACTOR`, `PAYMENT_TIMEOUT_MINUTES` y `CURRENCY` **no las consulta
ningún servicio**: el cálculo de envío tarifica con el peso real de los
artículos, Payments no expira los intentos de pago y los importes se formatean
como MXN en la interfaz. Siguen siendo editables porque existen en la tabla y el
backend las acepta, pero la pantalla las marca "Sin consumidor" para no dar a
entender que cambiarlas mueve algún cálculo.

### Elementos del diseño sin respaldo

| Elemento del diseño | Realidad del contrato | Resolución |
| --- | --- | --- |
| 11 KPIs, gráficas de ventas por región y de crecimiento de usuarios | No hay endpoints de métricas ni de series de tiempo | Eliminados |
| Gestión de usuarios, clientes, vendedores, admins, recepcionistas y repartidores | No hay CRUD de usuarios ni de empleados | Eliminada |
| Regiones, pedidos y envíos globales, incidencias | Existen en Prisma, pero `admin/` no los expone | Eliminados |
| Reportes y auditoría | `Auditoria` se **escribe** al aprobar y rechazar, pero no hay endpoint de lectura | Eliminados |
| Alta y edición de sucursales y vehículos | `admin/` solo tiene los `GET` | Las tablas no ofrecen acciones |
| Buscador global y notificaciones del panel | No hay endpoint de búsqueda administrativa ni módulo de notificaciones | Sustituidos por el enlace "Ir al sitio" |
| Historial de cambios de configuración | Solo se guarda `updatedAt` | Se muestra la última modificación; se avisa de que el valor anterior se pierde |

---

## 1. Catálogo público (bloquea el embudo de compra)

**Pantallas afectadas:** Home (`/`), Catálogo (`/catalogo`), Detalle de producto (`/producto/:id`).

El módulo `catalog` del backend es **solo de escritura para el vendedor**
(`POST /api/seller/products` y derivados). No expone ninguna lectura pública:
`catalog/controllers/inventory.controller.ts` y `variant.controller.ts` están
vacíos, y `category.controller.ts` solo tiene `POST`.

**Consecuencia directa:** `POST /api/cart/items` exige un `productoVarianteId`
(UUID). Sin lectura de catálogo no hay forma de obtenerlo desde la interfaz, así
que el carrito se puede integrar pero **no se puede llenar** desde la UI.

### Endpoints faltantes

| Endpoint esperado | Respuesta | Query |
| --- | --- | --- |
| `GET /api/catalog/products` | `ProductListResponse` | `page`, `limit`, `search`, `categoriaId`, `precioMin`, `precioMax`, `soloOfertas`, `orden` |
| `GET /api/catalog/products/:id` | `ProductDetailDto` | — (404 si no existe o no está publicado) |
| `GET /api/catalog/categories` | `CategoryDto[]` | — |

Los tres deberían ser **públicos** (sin `JwtAuthGuard`) y devolver solo
productos con `activo = true` y `publicado = true`.

### DTOs esperados

Definidos ya en [`src/types/catalog.ts`](src/types/catalog.ts), modelados sobre
el esquema de Prisma. Resumen:

```ts
CategoryDto        { id, parentId, nombre, slug, descripcion, productCount }
ProductImageDto    { id, url, orden, esPrincipal }
ProductVariantDto  { id, sku, precio, pesoKg, activa, stockDisponible,
                     atributos: { atributo, valor }[] }
ProductStoreDto    { id, vendedorId, codigoPublico, nombre, logoUrl }

ProductListItemDto { id, codigoPublico, nombre, categoriaId, tienda,
                     imagenPrincipalUrl, precioDesde, stockTotal, ...campos de diseño }

ProductDetailDto   extends ProductListItemDto
                   + { descripcion, pesoKg, altoCm, anchoCm, largoCm,
                       categoria, imagenes[], variantes[] }

ProductListResponse { products, page, limit, total, totalPages }
```

`precioDesde` es `min(variantes.precio)` y `stockTotal` la suma del
`Inventario.stockDisponible` de las variantes activas. La paginación sigue la
forma de `OrderListResponseDto`, que ya existe en Orders.

### Campos del diseño sin respaldo en el esquema

El diseño de Figma muestra datos que **Prisma no modela**. Están declarados como
opcionales en `ProductListItemDto` para que la interfaz degrade sin romperse:

| Campo | Qué haría falta |
| --- | --- |
| `precioAnterior`, `etiqueta` | Un modelo de promociones/descuentos |
| `calificacion`, `totalOpiniones` | Un modelo de opiniones (`Resena`) |
| `unidadesVendidas` | Un agregado sobre `PedidoItem` |
| `envioGratis` | Hoy el envío lo cotiza `GET /checkout` por vendedor y dirección, no por producto |

En la misma línea, los bloques de filtro **Calificación** y **Condición** se
conservan visualmente pero aparecen deshabilitados con la etiqueta
"Próximamente", y las pestañas de **Opiniones** y **Preguntas y Respuestas** del
detalle se sirven desde `catalogApi.listReviews` / `listQuestions`, que hoy
devuelven ejemplos.

### Estado en el frontend

✅ **Módulo 2 cerrado.** Home, Catálogo y Detalle están migrados a `features/`
con toda la interfaz real —filtros, orden, paginación, búsqueda, selector de
variante con stock, estados de carga, vacío y error—, alimentada por
[`services/api/catalog.api.ts`](src/services/api/catalog.api.ts).

**Para conectar el backend real basta con sustituir el cuerpo de tres funciones**
de ese archivo por la llamada `http.get(...)` que ya está escrita en el
comentario de cada una, y borrar `src/mocks/catalog.mock.ts`. Ni los
componentes, ni los hooks, ni los tipos cambian.

---

## 2. Alta y edición de direcciones

**Pantallas afectadas:** Checkout (`/checkout`), Mi cuenta (`/mi-cuenta`).

Solo existe lectura: `GET /api/checkout/addresses` → `CheckoutAddressDto[]`
(`id`, `alias`, `direccionFormateada`, `esPrincipal`).

**Es el hueco más visible del Módulo 4.** El diseño de Figma traía un formulario
editable en el paso "Dirección" (nombre, apellidos, calle, colonia, código
postal, ciudad), pero no hay dónde guardarlo, y `CheckoutAddressDto` ni siquiera
devuelve los campos por separado: llegan compuestos en `direccionFormateada`.
El formulario se sustituyó por un **selector** de las direcciones existentes.

Un cliente recién registrado **no tiene ninguna dirección**, así que
`GET /api/checkout` le responde `400 El cliente no tiene una dirección de
entrega principal registrada.` y no puede comprar. Verificado en el navegador.

| Endpoint esperado | Body esperado |
| --- | --- |
| `POST /api/addresses` | `calle`, `numeroExterior`, `numeroInterior?`, `colonia?`, `ciudad`, `estadoProvincia`, `codigoPostal`, `alias?`, `esPrincipal?` — campos tomados de `OrderDeliveryAddressDto` |
| `PATCH /api/addresses/:id` | mismos campos, todos opcionales |
| `DELETE /api/addresses/:id` | — |
| `GET /api/addresses/:id` | los campos por separado, para poder editarlos |

**Dependencias de backend:** módulo de Direcciones (no existe como módulo HTTP).
Ojo: `GET /checkout` exige que el código postal tenga coordenadas (`latitud`,
`longitud`) para cotizar el envío, así que el alta de direcciones tendrá que
resolverlas.

---

## 2b. Checkout — diferencias entre el diseño y el contrato

`GET /checkout` y `GET /checkout/addresses` quedaron integrados. Estas piezas
del diseño **no tienen respaldo** y se resolvieron como se indica:

| Elemento del diseño | Realidad del contrato | Resolución |
| --- | --- | --- |
| Formulario de dirección editable | No hay CRUD de direcciones | Selector de las existentes (ver sección 2) |
| Paso "Envío" con opciones Express $99 / Estándar gratis | El backend **no ofrece elegir método de envío**: lo cotiza por vendedor a partir de dirección, peso y distancia | El paso muestra el desglose real por vendedor, sin opciones que elegir |
| "Llega mañana antes de las 21:00" | Checkout no devuelve fechas de entrega | Eliminado: no se inventan fechas |
| Pasos "Pago" y "Confirmación" | Pertenecen a `POST /orders` y `POST /payments/intent` | Se conservan en el indicador, atenuados; el botón final está deshabilitado |
| "Impuestos estim. (16%)" sumado al total | `ivaIncluido` ya está **dentro** de `total` | Se muestra como "IVA incluido: $X", no como suma |
| `comisionMarketplace` | Informativa: es lo que CorreosClic descuenta a los **vendedores**, no la paga el cliente | **No se muestra** en el resumen de compra, para no dar a entender que la paga el comprador |

**Regla multivendedor.** `HighestPlusPartialShippingAggregationStrategy` cobra
completa la tarifa más alta (`esTarifaBase: true`) y de cada vendedor adicional
solo una fracción (`recargoAplicado`). Por eso **la suma de `envioDetalle[].tarifa`
no es igual a `shipping`**. La interfaz muestra el importe realmente aplicado y
explica la tarifa individual aparte; mostrar solo `tarifa` haría que las cifras
no cuadraran.

---

## 3. Módulo de Usuarios (el siguiente que falta)

**Pantalla afectada:** Mi cuenta (`/mi-cuenta`).

`/mi-cuenta` se reconstruyó desde cero en `features/account` durante el Módulo
9. Muestra **solo lo que la sesión ya conoce** —`AuthenticatedUserDto`: nombre
completo, correo y roles—, los accesos a las pantallas que corresponden a esos
roles y el cierre de sesión. No hace ninguna llamada propia porque no hay a qué
llamarla.

La pantalla del export traía además favoritos, direcciones, métodos de pago,
seguridad y edición de perfil. **No se conservaron ni deshabilitados**: eran
controles sin ningún endpoint detrás, y un control deshabilitado promete algo
que no existe. Todo eso pertenece a un módulo de Usuarios que aún no se ha
construido.

### Lo que haría falta

| Endpoint esperado | Para qué | Estado en Prisma |
| --- | --- | --- |
| `GET /api/users/me` | Perfil completo: teléfono, fecha de alta, avatar | `Usuario` ya tiene `telefono`, `createdAt` |
| `PATCH /api/users/me` | Editar nombre, apellidos y teléfono | — |
| `POST /api/users/me/password` | Cambio de contraseña | `passwordHash` existe; falta el caso de uso |
| CRUD de direcciones | Alta y edición desde la cuenta y desde Checkout | Ver la **sección 2**: es el mismo hueco, y bloquea la primera compra de todo cliente nuevo |
| Favoritos | El corazón de la tarjeta de producto y del detalle | **No hay modelo**: haría falta uno nuevo (`Favorito`) |
| Sesiones y seguridad | Cerrar sesión en otros dispositivos, verificación en dos pasos | No hay refresh token ni registro de sesiones (ver sección 0) |

Mientras no exista, `/mi-cuenta` sigue siendo el punto de entrada del usuario
autenticado: los accesos por rol se declaran en
[`features/account/lib/role-access.ts`](src/features/account/lib/role-access.ts),
y solo aparecen los destinos a los que ese usuario puede entrar de verdad.

---

## 4. Catálogo del vendedor ("Mis productos")

✅ **Resuelto en el Módulo 8.** `GET /api/seller/products` (paginado, con stock,
precio desde y estado de publicación) y `GET /api/seller/products/:id` ya
existen, junto con `PATCH /api/seller/products/:id/publication`.

Sigue faltando `PATCH /api/seller/products/:id` para **editar** nombre,
descripción, categoría y peso: hoy un producto no se puede corregir tras el
alta. Ver la sección 0d.

---

## 5. Métricas, reportes y CRUD administrativo

✅ **Resuelto en lo que tenía backend.** El Módulo 9 integró las cuatro
secciones reales (ver la sección 0e) y `/admin/local`, `/admin/regional` y
`/admin/super` desaparecieron con el resto del export.

Lo que sigue sin existir, y por tanto sin pantalla:

| Falta | Detalle |
| --- | --- |
| Métricas y series de tiempo | No hay agregados ni endpoints de reportes, ni para el panel administrativo ni para el de vendedor |
| CRUD de sucursales, vehículos y zonas tarifarias | `admin/` solo expone lecturas |
| Gestión de usuarios, empleados y repartidores | No hay módulo HTTP |
| Lectura de auditoría | `Auditoria` se escribe al aprobar y rechazar solicitudes, pero nada la consulta |
| Alcance de `ADMIN_REGIONAL` y `ADMIN_LOCAL` | Sin endpoints propios: por menor privilegio, `admin/` es solo de `SUPER_ADMIN` |

---

## 6. Módulos no construidos

Sin controladores ni servicios en el backend. Las pantallas del diseño que los
representen quedan con mock y navegación funcional.

| Módulo | Estado en Prisma |
| --- | --- |
| Refunds / Reembolsos | `Reembolso` existe en el esquema, sin módulo NestJS |
| Liquidaciones a vendedores | `LiquidacionVendedor`, `LiquidacionVendedorDetalle` |
| Notificaciones | `DispositivoPush`, `PlantillaNotificacion`, `Notificacion` |
| Reportes | — |

---

## Deuda técnica del Módulo 0

| Punto | Detalle |
| --- | --- |
| ~~`src/app/legacy/FigmaExport.tsx`~~ | **Eliminado en el Módulo 9**, junto con `legacy-screens.tsx` y el directorio `app/legacy/` entero. Sus cuatro últimas pantallas se reconstruyeron en `features/account` y `features/admin`. **Ya no queda ninguna pantalla legacy: toda la aplicación vive en `features/`.** |
| Cupones de descuento | El campo del carrito es del diseño; no hay modelo ni endpoint de cupones. Avisa "próximamente". |
| IVA en el carrito | `ShoppingCartDto` no incluye el desglose de IVA (`GET /checkout` sí lo manda en `ivaIncluido`, leyendo `IVA_PERCENTAGE` de la configuración del sistema). Por eso el resumen del carrito indica "IVA incluido" sin cifra y el envío se muestra como "Se calcula en el siguiente paso". |
| Favoritos | El corazón de la tarjeta de producto y del detalle es solo visual: no existe modelo ni endpoint de favoritos. |
| Tiendas destacadas | `Tienda` existe en Prisma pero no hay endpoint de lectura; la portada usa contenido estático de `features/catalog/lib/home-content.ts`. |
| ~~`src/app/legacy/LegacyUiStateProvider.tsx`~~ | **Eliminado en el Módulo 8.** `sellerStatus` lo da `GET /seller/requests/me` y el modo cliente/vendedor se resuelve con rutas y roles reales. |
| ~~`src/hooks/useViewNavigate.ts`~~ | **Eliminado en el Módulo 9.** No lo usaba solo el legacy: `Navbar` y `Footer` también navegaban con él y se migraron a `<Link>` / `useNavigate`. |
| ~~Selector de rol de la navbar~~ | **Retirado en el Módulo 9.** Era un atajo de demostración que saltaba a cualquier panel sin comprobar nada, y tres de sus opciones apuntaban a rutas que desaparecieron. Los accesos reales están en `AccountMenu` y en `/mi-cuenta`, y dependen de los roles de la sesión. |
| Pantalla "Mi cuenta" | Reconstruida en `features/account` (Módulo 9), sin los datos de ejemplo del diseño. Lo que falta —perfil editable, direcciones, favoritos, seguridad— es el módulo de Usuarios de la **sección 3**. |
| Jerarquía de roles | Sigue sin existir: cada ruta exige exactamente su rol porque el backend no define ninguna. En `admin/` es además una decisión explícita de menor privilegio (solo `SUPER_ADMIN`). |
| Dependencias sin uso | El export arrastra `canvas-confetti`, `motion`, `react-dnd`, `react-dnd-html5-backend`, `react-slick`, `react-responsive-masonry`, `react-popper` y `@popperjs/core`, que no se importan en ningún archivo. Se conservaron para no salirse del alcance acordado; conviene decidir si se eliminan. |
