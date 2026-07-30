# Integraciones pendientes — frontend-web

Registro de las pantallas cuyo backend todavía no existe y de los contratos que
harían falta para conectarlas. Se actualiza al cerrar cada módulo.

**Última actualización:** 2026-07-30 (cierre del Módulo 0 — Scaffold)

> El inventario de endpoints **reales** del backend se levantó leyendo los
> controladores de `apps/backend/src`. Ninguna pantalla debe llamar a un
> endpoint que no aparezca ahí.

---

## 1. Catálogo público (bloquea el embudo de compra)

**Pantallas afectadas:** Home (`/`), Catálogo (`/catalogo`), Detalle de producto (`/producto`).

El módulo `catalog` del backend es **solo de escritura para el vendedor**
(`POST /api/seller/products` y derivados). No expone ninguna lectura pública:
`catalog/controllers/inventory.controller.ts` y `variant.controller.ts` están
vacíos, y `category.controller.ts` solo tiene `POST`.

**Consecuencia directa:** `POST /api/cart/items` exige un `productoVarianteId`
(UUID). Sin lectura de catálogo no hay forma de obtenerlo desde la interfaz, así
que el carrito se puede integrar pero **no se puede llenar** desde la UI.

| Endpoint esperado | Respuesta esperada | Notas |
| --- | --- | --- |
| `GET /api/catalog/products` | `{ products: ProductListItemDto[], page, limit, total, totalPages }` | Filtros por categoría, texto, rango de precio y orden. Paginación igual a `OrderListQueryDto` (`page`, `limit ≤ 100`). |
| `GET /api/catalog/products/:id` | `ProductDetailDto` con `variantes[]` (cada una con `id`, `sku`, `precio`, `stockDisponible`, `atributos[]`) e `imagenes[]` | El `id` de variante es lo que consume el carrito. |
| `GET /api/catalog/categories` | `CategoryDto[]` (árbol o plano con `parentId`) | Hoy solo existe `POST /api/catalog/categories`. |

**Dependencias de backend:** módulo `catalog` (entidades `Producto`,
`ProductoVariante`, `Inventario`, `ProductoImagen`, `Categoria` ya existen en
Prisma; falta la capa de lectura).

**Estado en el frontend:** pendiente. Se resolverá en el **Módulo 2** con datos
mock tipados detrás de `services/api/catalog.api.ts`, de modo que conectar el
backend real consista en cambiar el cuerpo de tres funciones.

---

## 2. Alta y edición de direcciones

**Pantallas afectadas:** Checkout (`/checkout`), Mi cuenta (`/mi-cuenta`).

Solo existe lectura: `GET /api/checkout/addresses` → `CheckoutAddressDto[]`
(`id`, `alias`, `direccionFormateada`, `esPrincipal`).

`POST /api/orders` requiere un `direccionId`, así que un usuario **sin ninguna
dirección registrada no puede completar una compra** desde el frontend.

| Endpoint esperado | Body esperado |
| --- | --- |
| `POST /api/addresses` | `calle`, `numeroExterior`, `numeroInterior?`, `colonia?`, `ciudad`, `estadoProvincia`, `codigoPostal`, `alias?`, `esPrincipal?` — campos tomados de `OrderDeliveryAddressDto` |
| `PATCH /api/addresses/:id` | mismos campos, todos opcionales |
| `DELETE /api/addresses/:id` | — |

**Dependencias de backend:** módulo de Direcciones (no existe como módulo HTTP).

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
| `src/app/legacy/FigmaExport.tsx` | Las 15 pantallas del export siguen en un solo archivo (4 784 líneas). Cada módulo extrae las suyas a `features/`. El archivo desaparece al terminar el Módulo 9. |
| `src/app/legacy/LegacyUiStateProvider.tsx` | Sostiene `sellerStatus` y `mode`, que en el export vivían dentro de `App()`. `sellerStatus` lo dará el onboarding real (Módulo 8) y `mode` pasará a derivarse de los roles del usuario. |
| `src/hooks/useViewNavigate.ts` | Traduce el `setView("catalog")` del export a rutas reales. Se elimina cuando todas las pantallas usen `<Link>` / `useNavigate`. |
| Guards de ruta | `ProtectedRoute` y `RoleRoute` están implementados pero **no montados**: hacerlo antes de que el login autentique dejaría el diseño inaccesible. Se activan en el Módulo 1. |
| Tamaño del bundle | 967 kB en un solo chunk. Se resuelve solo al migrar pantallas a `features/` con rutas `lazy`. |
| Dependencias sin uso | El export arrastra `canvas-confetti`, `motion`, `react-dnd`, `react-dnd-html5-backend`, `react-slick`, `react-responsive-masonry`, `react-popper` y `@popperjs/core`, que no se importan en ningún archivo. Se conservaron para no salirse del alcance acordado; conviene decidir si se eliminan. |
