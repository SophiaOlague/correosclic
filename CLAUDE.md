# CorreosClic

Marketplace mexicano inspirado en Correos de México. Monorepo pnpm.

```
apps/backend        NestJS 11 + Prisma + PostgreSQL   ← fuente de verdad
apps/frontend-web   Vite 6 + React 18 + React Router 7 + Tailwind v4 + shadcn
apps/mobile         Expo React Native                 ← NO tocar
packages/database   esquema Prisma + seeds
```

---

## Regla número uno

**El backend es la fuente de verdad y no se modifica.** Ninguna pantalla puede
llamar a un endpoint que no exista en un controlador de `apps/backend/src`.

Antes de integrar cualquier cosa, lee el controlador, el DTO y el servicio
reales. **No deduzcas endpoints, no los inventes, no asumas que existen porque
el diseño los sugiere.**

Si encuentras un defecto evidente del backend: **repórtalo y espera aprobación**.
No lo corrijas por tu cuenta. Cuando se autorice, va en un commit independiente
del frontend.

---

## Estado de la integración

El frontend nació de un export de Figma que era un solo `App.tsx` de 5 051
líneas. Se está migrando módulo a módulo a `features/`.

| # | Módulo | Estado |
| --- | --- | --- |
| 0 | Scaffold | ✅ |
| 1 | Auth | ✅ integrado |
| 2 | Catálogo y Producto | ✅ migrado, **datos mock** (el backend no tiene lectura de catálogo) |
| 3 | Carrito | ✅ integrado |
| 4 | Checkout | ✅ integrado |
| 5 | Orders | ✅ integrado |
| 6 | Payments | ✅ integrado (Stripe Elements, solo tarjeta) |
| 7 | Logistics | ✅ integrado (cliente, vendedor, recepción y reparto) |
| 8 | Seller | ⬜ pendiente — onboarding sí, "mis productos" no existe |
| 9 | Admin | ⬜ pendiente — casi todo mock, solo hay `seller-requests` |

Quedan **6 pantallas** en `src/app/legacy/FigmaExport.tsx` (1 909 líneas). Ese
archivo desaparece al terminar el Módulo 9.

**Lee siempre `apps/frontend-web/PENDING_INTEGRATIONS.md`**: es el registro vivo
de qué falta en el backend, qué DTOs se esperan y qué decisiones se tomaron.

---

## El diseño ya está en el repo

No hace falta volver a subir nada de Figma. Todo vive aquí:

- `src/components/ui/` — 46 componentes shadcn del export
- `src/styles/theme.css` — tokens de marca: magenta `#E4007C`, verde `#006847`,
  gris de campo `#F5F6F8`, radio `.5rem`, tipografía Inter
- `src/app/legacy/FigmaExport.tsx` — las pantallas que faltan por migrar

**No rediseñes.** Conserva colores, tipografía, espaciados e iconografía. Las
pantallas nuevas deben parecer diseñadas originalmente en Figma. No mezcles
librerías de UI: solo shadcn/Radix + lucide-react.

Sí puedes: agregar campos que el DTO exija, validaciones, estados de carga,
vacío y error, paginación y filtros. El export no es inmutable.

---

## Convenciones del frontend

### Arquitectura

```
services/api/*.api.ts   →   features/*/hooks/*.ts   →   features/*/pages|components
```

- **Ninguna llamada HTTP fuera de `services/api/`.** Todo pasa por
  `services/http/client.ts`.
- **TanStack Query es la única fuente del estado del servidor.** Sin copias
  locales que puedan desincronizarse. Si un endpoint devuelve el recurso
  completo, escribe esa respuesta en la caché en vez de reconstruirla.
- **Sin actualizaciones optimistas** salvo que se pidan. Primero corrección.
- **Lazy loading en todas las rutas** (`React.lazy` + `Suspense` en `RootLayout`).
- Formularios con React Hook Form + Zod. Los esquemas Zod replican las reglas de
  `class-validator` del DTO, mensajes en español incluidos.

### Dinero y cálculos

**Nunca recalcules importes financieros en el frontend.** Subtotal, envío, IVA,
comisión y total los calcula el backend. El frontend formatea y presenta.

Casos reales que hay que respetar:
- `ivaIncluido` ya está **dentro** de `total`, no se suma.
- `comisionMarketplace` es lo que CorreosClic descuenta a los vendedores: **no
  se muestra al cliente**.
- En envío multivendedor, la suma de `envioDetalle[].tarifa` **no** es igual a
  `shipping`: solo la tarifa más alta se cobra completa y las demás aportan
  `recargoAplicado`.

### Datos que el backend no da

Varios campos del diseño no existen en Prisma (`calificacion`, `precioAnterior`,
`envioGratis`, fechas de entrega...). Están declarados opcionales.

**Los componentes nunca deben depender de ellos para renderizar.** Si faltan, la
interfaz degrada sin huecos ni franjas vacías. No inventes fechas, costos ni
datos logísticos.

### Idioma

Interfaz, mensajes y comentarios de código en español. Identificadores en
inglés. Los mensajes de error del backend ya vienen redactados en español: se
muestran literalmente en vez de reescribirlos.

---

## Metodología

Un módulo completo por vez. Al terminar cada uno:

1. `pnpm typecheck` y `pnpm build` desde la raíz
2. Verificación del flujo **contra el backend real**, no solo compilación
3. Actualizar `PENDING_INTEGRATIONS.md`
4. **Detenerse y presentar el resultado**; no avanzar al siguiente módulo sin
   aprobación
5. El usuario hace los commits: propón un nombre en inglés y el cuerpo

No mezcles módulos en un commit. Backend y frontend siempre en commits separados.

---

## Entorno de pruebas

```bash
pnpm install
pnpm dev:api    # backend en :3000  (prefijo global /api)
pnpm dev:web    # frontend en :5173
```

Cuentas sembradas, contraseña `Correos123*`:
`cliente@correosclic.mx` · `vendedor@correosclic.mx` (Durango) ·
`vendedor2@correosclic.mx` (Jalisco) · `recepcionista.durango@correosclic.mx`

Para probar pagos hace falta reenviar los webhooks de Stripe. El CLI no está
autenticado, pero funciona con la clave del propio proyecto y su secreto de
firma coincide con el `STRIPE_WEBHOOK_SECRET` configurado:

```bash
stripe listen --api-key <STRIPE_SECRET_KEY de apps/backend/.env> \
  --forward-to localhost:3000/api/payments/webhooks/stripe
```

Los campos de tarjeta de Stripe **no se dejan automatizar** desde el navegador
de pruebas. Para verificar el flujo, confirma el PaymentIntent por API:

```bash
stripe payment_intents confirm <pi_...> --api-key <sk> \
  --payment-method pm_card_visa --return-url http://localhost:5173/pago/<orderId>
```

Produce el mismo cobro y el mismo webhook real. Usa `pm_card_chargeDeclined`
para el caso de rechazo.

---

## Logística: quién decide qué

El motor del backend planifica **solo**: ruta, transferencia, vehículo y
repartidor los resuelve `LogisticsPlanningEngine` a partir de hechos físicos.
Ninguna pantalla ofrece elegir nada de eso.

- El **recepcionista** únicamente certifica en qué estado llegó el paquete
  (`ACEPTADO`, `DANADO`, `RECHAZADO`). Aceptar encadena clasificación, ruta y
  asignación dentro de la misma petición: la respuesta puede llegar ya en
  `EN_TRANSITO` o `EN_REPARTO`.
- El **repartidor** informa qué pasó (`ResultadoIntentoEntrega`); es
  `DeliveryRetryPolicy` quien decide entre reintentar y devolver.
- El **historial de tracking se renderiza en el orden recibido**, sin pasos
  futuros atenuados: un envío sin transferencia nunca pasa por `EN_TRANSITO`,
  así que dibujarlo sería prometer una etapa que no ocurrirá.

`AuthenticatedUserDto` se queda en identidad y autorización (`id`, `email`,
nombre, `roles`). El contexto operativo del empleado —sucursal, `empleadoId`,
puesto— pertenece a Logistics y se obtiene con **`GET /logistics/branches/me`**,
no desde la sesión: meterlo en el DTO obligaría a `JwtStrategy` a resolver un
`Empleado` en cada petición autenticada, también para quien nunca usa Logistics.

## Deuda conocida

- `src/app/legacy/FigmaExport.tsx` — 6 pantallas por extraer
- `src/hooks/useViewNavigate.ts` — puente temporal entre el `setView("x")` del
  export y las rutas reales; desaparece con la última pantalla
- `src/app/legacy/LegacyUiStateProvider.tsx` — sostiene `sellerStatus`, que
  dará el onboarding real (Módulo 8)
- `src/mocks/catalog.mock.ts` — datos volcados de la BD sembrada, con UUIDs
  **reales** para que el carrito funcione. Se borra cuando existan los GET de
  catálogo; solo lo consume `catalog.api.ts`
- El selector de rol de la navbar es un atajo de demo del diseño
- Sin jerarquía entre roles: cada ruta de administración exige exactamente el
  suyo, porque el backend no define ninguna
