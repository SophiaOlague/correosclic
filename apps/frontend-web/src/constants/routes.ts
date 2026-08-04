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
  tracking: '/rastreo',

  becomeSeller: '/vender',
  sellerDashboard: '/vendedor',

  reception: '/recepcion',
  driver: '/repartidor',

  adminLocal: '/admin/local',
  adminRegional: '/admin/regional',
  adminSuper: '/admin/super',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
