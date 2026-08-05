/**
 * Rutas de la aplicación. Única fuente de verdad para la navegación:
 * ningún componente debe escribir un path a mano.
 */
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/registro',

  catalog: '/catalogo',
  product: '/producto',

  cart: '/carrito',
  checkout: '/checkout',
  payment: '/pago',

  account: '/mi-cuenta',
  orders: '/mis-pedidos',
  /** Detalle de un envío: `/envio/:id`. */
  shipment: '/envio',
  /**
   * El backend no expone ninguna lista global de envíos: solo los de un pedido
   * (`GET /logistics/orders/:pedidoId/shipments`). Sin un pedido de partida no
   * hay nada que rastrear, así que esta ruta lleva a "Mis pedidos".
   */
  tracking: '/rastreo',

  becomeSeller: '/vender',
  sellerDashboard: '/vendedor',
  vendorShipments: '/vendedor/envios',
  /** Ficha de un producto propio: `/vendedor/productos/:id`. */
  sellerProducts: '/vendedor/productos',
  sellerNewProduct: '/vendedor/productos/nuevo',

  reception: '/recepcion',
  driver: '/repartidor',

  /**
   * Panel administrativo. Las cuatro secciones son exactamente las que tienen
   * backend (`apps/backend/src/admin`), y las cuatro exigen `SUPER_ADMIN`.
   *
   * Sustituyen a `/admin/local`, `/admin/regional` y `/admin/super`, que eran
   * las tres pantallas mock del export: `ADMIN_LOCAL` y `ADMIN_REGIONAL` no
   * tienen todavía ninguna funcionalidad propia.
   */
  admin: '/admin',
  /** Detalle de una solicitud: `/admin/solicitudes/:id`. */
  adminSellerRequests: '/admin/solicitudes',
  adminBranches: '/admin/sucursales',
  adminVehicles: '/admin/vehiculos',
  adminSystemConfig: '/admin/configuracion',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
