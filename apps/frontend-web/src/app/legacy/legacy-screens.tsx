import { useNavigate } from 'react-router';

import { ROUTES } from '@/constants/routes';
import { useViewNavigate } from '@/hooks/useViewNavigate';

import * as Figma from './FigmaExport';

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

/**
 * En el export, `/mi-cuenta` alternaba entre el panel de cliente y el de
 * vendedor con un estado local. El panel de vendedor ya es una pantalla real
 * (`/vendedor`, Módulo 8), así que aquí solo queda el de cliente y el botón de
 * cambio de rol navega a la ruta correspondiente.
 */
export function AccountScreen() {
  const setView = useViewNavigate();
  const navigate = useNavigate();

  return (
    <main>
      <Figma.Dashboard
        setView={setView}
        switchRole={() => navigate(ROUTES.sellerDashboard)}
      />
    </main>
  );
}

/* Paneles a pantalla completa: en el export se montaban fuera de `<main>`. */

export function AdminLocalScreen() {
  return <Figma.LocalAdminDashboard setView={useViewNavigate()} />;
}

export function AdminRegionalScreen() {
  return <Figma.RegionalAdminDashboard setView={useViewNavigate()} />;
}

export function AdminSuperScreen() {
  return <Figma.SuperAdminDashboard setView={useViewNavigate()} />;
}
