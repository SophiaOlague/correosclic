import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';

import { RootLayout } from '@/components/layout/RootLayout';
import { ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';

import { GuestRoute, ProtectedRoute, RoleRoute } from './ProtectedRoute';

/**
 * Definición de rutas de CorreosClic.
 *
 * Todas las rutas se cargan de forma diferida: el bundle inicial solo trae el
 * layout y los providers, y cada pantalla llega en su propio chunk cuando se
 * visita. `RootLayout` envuelve el `<Outlet/>` en `<Suspense>`.
 *
 * Las pantallas que aún no se han migrado se resuelven desde
 * `legacy/legacy-screens`, que queda en un chunk aparte del arranque.
 */
const lazyLegacy = <K extends keyof typeof import('./legacy/legacy-screens')>(name: K) =>
  lazy(() =>
    import('./legacy/legacy-screens').then((module) => ({
      default: module[name] as React.ComponentType,
    })),
  );

/* Módulo 1 — Auth (integrado) */
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));

/* Pendientes de migración */
const HomeScreen = lazyLegacy('HomeScreen');
const CatalogScreen = lazyLegacy('CatalogScreen');
const ProductDetailScreen = lazyLegacy('ProductDetailScreen');
const CartScreen = lazyLegacy('CartScreen');
const CheckoutScreen = lazyLegacy('CheckoutScreen');
const AccountScreen = lazyLegacy('AccountScreen');
const TrackingScreen = lazyLegacy('TrackingScreen');
const BecomeSellerScreen = lazyLegacy('BecomeSellerScreen');
const SellerDashboardScreen = lazyLegacy('SellerDashboardScreen');
const ReceptionScreen = lazyLegacy('ReceptionScreen');
const DriverScreen = lazyLegacy('DriverScreen');
const AdminLocalScreen = lazyLegacy('AdminLocalScreen');
const AdminRegionalScreen = lazyLegacy('AdminRegionalScreen');
const AdminSuperScreen = lazyLegacy('AdminSuperScreen');

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <RootLayout />,
    children: [
      /* Públicas */
      { index: true, element: <HomeScreen /> },
      { path: ROUTES.catalog, element: <CatalogScreen />, handle: { title: 'Catálogo' } },
      { path: ROUTES.product, element: <ProductDetailScreen />, handle: { title: 'Producto' } },

      /* Solo para visitantes: con sesión iniciada redirigen al panel por rol. */
      {
        element: <GuestRoute />,
        children: [
          { path: ROUTES.login, element: <LoginPage />, handle: { title: 'Iniciar Sesión' } },
          { path: ROUTES.register, element: <RegisterPage />, handle: { title: 'Registro' } },
        ],
      },

      /* Requieren sesión: los endpoints que consumen llevan JwtAuthGuard. */
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES.cart, element: <CartScreen />, handle: { title: 'Carrito' } },
          { path: ROUTES.checkout, element: <CheckoutScreen />, handle: { title: 'Finalizar compra' } },
          { path: ROUTES.account, element: <AccountScreen />, handle: { title: 'Mi cuenta' } },
          { path: ROUTES.tracking, element: <TrackingScreen />, handle: { title: 'Rastrear pedido' } },
          { path: ROUTES.becomeSeller, element: <BecomeSellerScreen />, handle: { title: 'Vender' } },
        ],
      },

      /* Requieren un rol concreto. Sin jerarquía entre roles: el backend no
         define ninguna, así que cada ruta exige exactamente el suyo. */
      {
        element: <RoleRoute roles={[ROLES.vendedor]} />,
        children: [
          { path: ROUTES.sellerDashboard, element: <SellerDashboardScreen />, handle: { title: 'Vendedor' } },
        ],
      },
      {
        element: <RoleRoute roles={[ROLES.recepcion]} />,
        children: [
          { path: ROUTES.reception, element: <ReceptionScreen />, handle: { title: 'Recepción' } },
        ],
      },
      {
        element: <RoleRoute roles={[ROLES.repartidor]} />,
        children: [
          { path: ROUTES.driver, element: <DriverScreen />, handle: { title: 'Repartidor' } },
        ],
      },
      {
        element: <RoleRoute roles={[ROLES.adminLocal]} />,
        children: [
          { path: ROUTES.adminLocal, element: <AdminLocalScreen />, handle: { title: 'Admin Local' } },
        ],
      },
      {
        element: <RoleRoute roles={[ROLES.adminRegional]} />,
        children: [
          { path: ROUTES.adminRegional, element: <AdminRegionalScreen />, handle: { title: 'Admin Regional' } },
        ],
      },
      {
        element: <RoleRoute roles={[ROLES.superAdmin]} />,
        children: [
          { path: ROUTES.adminSuper, element: <AdminSuperScreen />, handle: { title: 'Super Admin' } },
        ],
      },

      { path: '*', element: <Navigate to={ROUTES.home} replace /> },
    ],
  },
]);
