# Integraciones pendientes — frontend-web

Registro de las pantallas cuyo backend todavía no existe y de los contratos que
harían falta para conectarlas. Se actualiza al cerrar cada módulo.

**Última actualización:** 2026-08-01 (cierre del Módulo 6 — Payments)

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

## 3. Perfil de usuario

**Pantallas afectadas:** Mi cuenta (`/mi-cuenta`).

No hay módulo de Usuarios expuesto por HTTP. Lo único disponible es
`GET /api/auth/ping`, que devuelve `AuthenticatedUserDto`.

| Endpoint esperado | Notas |
| --- | --- |
| `GET /api/users/me` | Perfil completo (teléfono, fecha de alta, avatar). |
| `PATCH /api/users/me` | Editar nombre, apellidos, teléfono. |
| `POST /api/users/me/password` | Cambio de contraseña. |

---

## 4. Catálogo del vendedor ("Mis productos")

**Pantallas afectadas:** Panel de vendedor (`/vendedor`).

Se puede **crear** producto, variante, inventario e imágenes, pero no listarlos:
no existe `GET /api/seller/products`.

| Endpoint esperado |
| --- |
| `GET /api/seller/products` (paginado, con stock y estado de publicación) |
| `GET /api/seller/products/:id` |
| `PATCH /api/seller/products/:id` |

---

## 5. Métricas, reportes y CRUD administrativo

**Pantallas afectadas:** Admin Local (`/admin/local`), Admin Regional
(`/admin/regional`), Super Admin (`/admin/super`), y las gráficas de ventas del
panel de vendedor.

Del área administrativa **solo existe** la gestión de solicitudes de vendedor:

- `GET /api/admin/seller-requests`
- `GET /api/admin/seller-requests/:id`
- `PATCH /api/admin/seller-requests/:id/approve`
- `PATCH /api/admin/seller-requests/:id/reject`

Todo lo demás de esos paneles (KPIs, series de tiempo, gestión de sucursales,
usuarios, repartidores, zonas tarifarias) **no tiene backend**. Se mantendrá con
datos mock y su diseño intacto.

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
| `src/app/legacy/FigmaExport.tsx` | Las 10 pantallas restantes del export siguen en un solo archivo (3 348 líneas). Cada módulo extrae las suyas a `features/`. El archivo desaparece al terminar el Módulo 9. |
| Cupones de descuento | El campo del carrito es del diseño; no hay modelo ni endpoint de cupones. Avisa "próximamente". |
| IVA en el carrito | `ShoppingCartDto` no incluye el desglose de IVA (`GET /checkout` sí lo manda en `ivaIncluido`, leyendo `IVA_PERCENTAGE` de la configuración del sistema). Por eso el resumen del carrito indica "IVA incluido" sin cifra y el envío se muestra como "Se calcula en el siguiente paso". |
| Favoritos | El corazón de la tarjeta de producto y del detalle es solo visual: no existe modelo ni endpoint de favoritos. |
| Tiendas destacadas | `Tienda` existe en Prisma pero no hay endpoint de lectura; la portada usa contenido estático de `features/catalog/lib/home-content.ts`. |
| `src/app/legacy/LegacyUiStateProvider.tsx` | Sostiene `sellerStatus`, que dará el onboarding real (Módulo 8). El `mode` cliente/vendedor ya se deriva de los roles de la sesión. |
| `src/hooks/useViewNavigate.ts` | Traduce el `setView("catalog")` del export a rutas reales. Se elimina cuando todas las pantallas usen `<Link>` / `useNavigate`. |
| Selector de rol de la navbar | Atajo de demo del diseño de Figma. Con los guards activos, elegir un rol que no se tiene redirige y avisa. Queda por decidir si se retira al cerrar la integración. |
| Pantalla "Mi cuenta" | La integró el diseño con datos de ejemplo ("María González"). El perfil real depende de un módulo de Usuarios que no existe (ver sección 3). |
| Jerarquía de roles | Cada ruta de administración exige exactamente su rol: el backend no define ninguna jerarquía, así que un `SUPER_ADMIN` no entra a `/admin/local` salvo que también tenga ese rol. Confirmar si es lo deseado. |
| Dependencias sin uso | El export arrastra `canvas-confetti`, `motion`, `react-dnd`, `react-dnd-html5-backend`, `react-slick`, `react-responsive-masonry`, `react-popper` y `@popperjs/core`, que no se importan en ningún archivo. Se conservaron para no salirse del alcance acordado; conviene decidir si se eliminan. |
