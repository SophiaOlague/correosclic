import { useViewNavigate } from '@/hooks/useViewNavigate';

import * as Figma from './FigmaExport';
import { useLegacyUiState } from './LegacyUiStateProvider';

/**
 * Adaptadores entre el router y las pantallas del export de Figma.
 *
 * Las pantallas exportadas esperan un prop `setView(view: string)`; aquí se les
 * inyecta el equivalente basado en rutas sin tocar su contenido. El objetivo es
 * que la aplicación funcione y navegue de verdad mientras cada módulo se migra
 * a `features/`, momento en que el adaptador correspondiente se elimina.
 *
 * TODO: Backend integration pending — ninguna de estas pantallas consume aún
 * la API; todas siguen mostrando los datos de ejemplo del diseño.
 */

export function CheckoutScreen() {
  return (
    <main>
      <Figma.Checkout setView={useViewNavigate()} />
    </main>
  );
}

export function TrackingScreen() {
  return (
    <main>
      <Figma.OrderTracking setView={useViewNavigate()} />
    </main>
  );
}

/**
 * En el export, `/mi-cuenta` alternaba entre el panel de cliente y el de
 * vendedor con un estado local `mode`. Se conserva ese comportamiento hasta que
 * el Módulo 8 lo derive de los roles reales del usuario.
 */
export function AccountScreen() {
  const setView = useViewNavigate();
  const { sellerStatus, setSellerStatus, mode, setMode } = useLegacyUiState();

  return (
    <main>
      {mode === 'vendedor' ? (
        <Figma.SellerDashboard setView={setView} switchRole={() => setMode('cliente')} />
      ) : (
        <Figma.Dashboard
          setView={setView}
          sellerStatus={sellerStatus}
          setSellerStatus={setSellerStatus}
          switchRole={() => setMode('vendedor')}
        />
      )}
    </main>
  );
}

export function SellerDashboardScreen() {
  const setView = useViewNavigate();
  const { setMode } = useLegacyUiState();

  return (
    <main>
      <Figma.SellerDashboard
        setView={setView}
        switchRole={() => {
          setMode('cliente');
          setView('dashboard');
        }}
      />
    </main>
  );
}

export function BecomeSellerScreen() {
  const setView = useViewNavigate();
  const { sellerStatus, setSellerStatus } = useLegacyUiState();

  return (
    <main>
      <Figma.BecomeSeller
        setView={setView}
        sellerStatus={sellerStatus}
        setSellerStatus={setSellerStatus}
      />
    </main>
  );
}

/* Paneles a pantalla completa: en el export se montaban fuera de `<main>`. */

export function ReceptionScreen() {
  return <Figma.ReceptionistDashboard setView={useViewNavigate()} />;
}

export function DriverScreen() {
  return <Figma.DriverDashboard setView={useViewNavigate()} />;
}

export function AdminLocalScreen() {
  return <Figma.LocalAdminDashboard setView={useViewNavigate()} />;
}

export function AdminRegionalScreen() {
  return <Figma.RegionalAdminDashboard setView={useViewNavigate()} />;
}

export function AdminSuperScreen() {
  return <Figma.SuperAdminDashboard setView={useViewNavigate()} />;
}
