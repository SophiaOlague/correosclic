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

  reception: '/recepcion',
  driver: '/repartidor',

  adminLocal: '/admin/local',
  adminRegional: '/admin/regional',
  adminSuper: '/admin/super',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
