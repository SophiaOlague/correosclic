import { createBrowserRouter, Navigate } from 'react-router';

import { RootLayout } from '@/components/layout/RootLayout';
import { ROUTES } from '@/constants/routes';

import * as Legacy from './legacy/legacy-screens';

/**
 * Definición de rutas de CorreosClic.
 *
 * Cada ruta monta hoy la pantalla correspondiente del export de Figma a través
 * de un adaptador de `legacy/`. Conforme avancen los módulos, el `element` de
 * cada entrada pasará a apuntar a la página real de `features/` sin que cambie
 * ni el path ni la estructura del router.
 *
 * NOTA: las rutas privadas todavía NO están envueltas en `<ProtectedRoute>` /
 * `<RoleRoute>` (ya implementados en `./ProtectedRoute`). Se activan en el
 * Módulo 1 (Auth), cuando el login autentique de verdad; hacerlo antes dejaría
 * el diseño inaccesible para revisión.
 */
export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <RootLayout />,
    children: [
      { index: true, element: <Legacy.HomeScreen /> },

      { path: ROUTES.login, element: <Legacy.LoginScreen />, handle: { title: 'Iniciar Sesión' } },
      { path: ROUTES.register, element: <Legacy.RegisterScreen />, handle: { title: 'Registro' } },

      { path: ROUTES.catalog, element: <Legacy.CatalogScreen />, handle: { title: 'Catálogo' } },
      { path: ROUTES.product, element: <Legacy.ProductDetailScreen />, handle: { title: 'Producto' } },

      { path: ROUTES.cart, element: <Legacy.CartScreen />, handle: { title: 'Carrito' } },
      { path: ROUTES.checkout, element: <Legacy.CheckoutScreen />, handle: { title: 'Finalizar compra' } },

      { path: ROUTES.account, element: <Legacy.AccountScreen />, handle: { title: 'Mi cuenta' } },
      { path: ROUTES.tracking, element: <Legacy.TrackingScreen />, handle: { title: 'Rastrear pedido' } },

      { path: ROUTES.becomeSeller, element: <Legacy.BecomeSellerScreen />, handle: { title: 'Vender' } },
      { path: ROUTES.sellerDashboard, element: <Legacy.SellerDashboardScreen />, handle: { title: 'Vendedor' } },

      { path: ROUTES.reception, element: <Legacy.ReceptionScreen />, handle: { title: 'Recepción' } },
      { path: ROUTES.driver, element: <Legacy.DriverScreen />, handle: { title: 'Repartidor' } },

      { path: ROUTES.adminLocal, element: <Legacy.AdminLocalScreen />, handle: { title: 'Admin Local' } },
      { path: ROUTES.adminRegional, element: <Legacy.AdminRegionalScreen />, handle: { title: 'Admin Regional' } },
      { path: ROUTES.adminSuper, element: <Legacy.AdminSuperScreen />, handle: { title: 'Super Admin' } },

      { path: '*', element: <Navigate to={ROUTES.home} replace /> },
    ],
  },
]);
