import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';

/**
 * Único punto de montaje de los providers globales.
 *
 * `LegacyUiStateProvider` desapareció con el Módulo 8: sostenía `sellerStatus`,
 * que ahora da `GET /seller/requests/me`, y el modo cliente/vendedor, que ya se
 * resuelve con rutas y roles reales.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryProvider>
  );
}
