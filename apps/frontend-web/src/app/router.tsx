import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';

import { FullPageLoader } from '@/components/common/PageLoader';
import { RootLayout } from '@/components/layout/RootLayout';
import { ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';

import { GuestRoute, ProtectedRoute, RoleRoute } from './ProtectedRoute';

/**
 * Definición de rutas de CorreosClic.
 *
 * Todas las rutas se cargan de forma diferida: el bundle inicial solo trae el
 * layout y los providers, y cada pantalla llega en su propio chunk cuando se
 * visita. `RootLayout` envuelve el `<Outlet/>` en `<Suspense>`, y `AdminLayout`
 * hace lo propio en su rama.
 *
 * Hay dos raíces porque son dos shells distintos: el marketplace (navbar fija +
 * pie de página) y el panel administrativo (dashboard a pantalla completa con
 * sidebar oscuro). No queda ninguna pantalla del export de Figma.
 */

/* Módulo 1 — Auth (integrado) */
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));

/* Módulo 2 — Catálogo y Producto (datos mock tras `catalog.api.ts`) */
const HomePage = lazy(() => import('@/features/catalog/pages/HomePage'));
const CatalogPage = lazy(() => import('@/features/catalog/pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('@/features/products/pages/ProductDetailPage'));

/* Módulo 3 — Carrito (integrado contra `/cart`) */
const CartPage = lazy(() => import('@/features/cart/pages/CartPage'));

/* Módulo 4 — Checkout (integrado contra `/checkout`) */
const CheckoutPage = lazy(() => import('@/features/checkout/pages/CheckoutPage'));

/* Módulo 5 — Orders (integrado contra `/orders`) */
const OrdersPage = lazy(() => import('@/features/orders/pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/features/orders/pages/OrderDetailPage'));

/* Módulo 6 — Payments (Stripe Elements aislado en features/payments) */
const PaymentPage = lazy(() => import('@/features/payments/pages/PaymentPage'));

/* Módulo 7 — Logistics (integrado contra `/logistics`) */
const ShipmentDetailPage = lazy(() => import('@/features/logistics/pages/ShipmentDetailPage'));
const VendorShipmentsPage = lazy(() => import('@/features/logistics/pages/VendorShipmentsPage'));
const ReceptionPage = lazy(() => import('@/features/logistics/pages/ReceptionPage'));
const DriverPage = lazy(() => import('@/features/logistics/pages/DriverPage'));

/* Módulo 8 — Seller (onboarding, tienda y catálogo propio) */
const BecomeSellerPage = lazy(() => import('@/features/seller/pages/BecomeSellerPage'));
const SellerDashboardPage = lazy(() => import('@/features/seller/pages/SellerDashboardPage'));
const NewProductPage = lazy(() => import('@/features/seller/pages/NewProductPage'));
const SellerProductDetailPage = lazy(
  () => import('@/features/seller/pages/SellerProductDetailPage'),
);

/* Módulo 9 — Admin (las cuatro secciones con backend) */
const AdminLayout = lazy(() =>
  import('@/features/admin/components/AdminLayout').then((module) => ({
    default: module.AdminLayout,
  })),
);
const SellerRequestsPage = lazy(() => import('@/features/admin/pages/SellerRequestsPage'));
const SellerRequestDetailPage = lazy(
  () => import('@/features/admin/pages/SellerRequestDetailPage'),
);
const BranchesPage = lazy(() => import('@/features/admin/pages/BranchesPage'));
const VehiclesPage = lazy(() => import('@/features/admin/pages/VehiclesPage'));
const SystemConfigPage = lazy(() => import('@/features/admin/pages/SystemConfigPage'));

/* Punto de entrada del usuario autenticado, reconstruido en `features/`. */
const AccountPage = lazy(() => import('@/features/account/pages/AccountPage'));

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <RootLayout />,
    children: [
      /* Públicas */
      { index: true, element: <HomePage /> },
      { path: ROUTES.catalog, element: <CatalogPage />, handle: { title: 'Catálogo' } },
      { path: `${ROUTES.product}/:id`, element: <ProductDetailPage />, handle: { title: 'Producto' } },

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
          { path: ROUTES.cart, element: <CartPage />, handle: { title: 'Carrito' } },
          { path: ROUTES.checkout, element: <CheckoutPage />, handle: { title: 'Finalizar compra' } },
          { path: ROUTES.account, element: <AccountPage />, handle: { title: 'Mi cuenta' } },
          { path: ROUTES.orders, element: <OrdersPage />, handle: { title: 'Mis pedidos' } },
          { path: `${ROUTES.orders}/:id`, element: <OrderDetailPage />, handle: { title: 'Detalle del pedido' } },
          { path: `${ROUTES.payment}/:orderId`, element: <PaymentPage />, handle: { title: 'Pagar pedido' } },
          { path: `${ROUTES.shipment}/:id`, element: <ShipmentDetailPage />, handle: { title: 'Seguimiento del envío' } },
          /* Sin un pedido no hay envíos que listar: el backend solo los expone
             por pedido. Se conserva la ruta porque el pie de página enlaza a
             ella desde el diseño. */
          { path: ROUTES.tracking, element: <Navigate to={ROUTES.orders} replace /> },
          { path: ROUTES.becomeSeller, element: <BecomeSellerPage />, handle: { title: 'Vender' } },
        ],
      },

      /* Requieren un rol concreto. Sin jerarquía entre roles: el backend no
         define ninguna, así que cada ruta exige exactamente el suyo. */
      {
        element: <RoleRoute roles={[ROLES.vendedor]} />,
        children: [
          { path: ROUTES.sellerDashboard, element: <SellerDashboardPage />, handle: { title: 'Vendedor' } },
          { path: ROUTES.vendorShipments, element: <VendorShipmentsPage />, handle: { title: 'Envíos por entregar' } },
          /* `nuevo` antes que `:id`: si no, el id capturaría la palabra. */
          { path: ROUTES.sellerNewProduct, element: <NewProductPage />, handle: { title: 'Nuevo producto' } },
          { path: `${ROUTES.sellerProducts}/:id`, element: <SellerProductDetailPage />, handle: { title: 'Producto' } },
        ],
      },
      {
        element: <RoleRoute roles={[ROLES.recepcion]} />,
        children: [
          { path: ROUTES.reception, element: <ReceptionPage />, handle: { title: 'Recepción' } },
        ],
      },
      {
        element: <RoleRoute roles={[ROLES.repartidor]} />,
        children: [
          { path: ROUTES.driver, element: <DriverPage />, handle: { title: 'Repartidor' } },
        ],
      },
      { path: '*', element: <Navigate to={ROUTES.home} replace /> },
    ],
  },

  /*
   * Panel administrativo: raíz aparte, con su propio shell a pantalla completa.
   *
   * Las cuatro secciones exigen `SUPER_ADMIN` porque así lo exigen los nueve
   * endpoints de `apps/backend/src/admin`. El guard va por encima del layout
   * para que un rol equivocado ni siquiera monte el sidebar.
   */
  {
    path: ROUTES.admin,
    element: <RoleRoute roles={[ROLES.superAdmin]} />,
    children: [
      {
        element: (
          <Suspense fallback={<FullPageLoader label="Cargando el panel..." />}>
            <AdminLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <Navigate to={ROUTES.adminSellerRequests} replace /> },
          {
            path: ROUTES.adminSellerRequests,
            element: <SellerRequestsPage />,
            handle: { title: 'Solicitudes de vendedor' },
          },
          {
            path: `${ROUTES.adminSellerRequests}/:id`,
            element: <SellerRequestDetailPage />,
            handle: { title: 'Revisión de solicitud' },
          },
          {
            path: ROUTES.adminBranches,
            element: <BranchesPage />,
            handle: { title: 'Sucursales' },
          },
          {
            path: ROUTES.adminVehicles,
            element: <VehiclesPage />,
            handle: { title: 'Vehículos' },
          },
          {
            path: ROUTES.adminSystemConfig,
            element: <SystemConfigPage />,
            handle: { title: 'Configuración del sistema' },
          },
        ],
      },
    ],
  },
]);
