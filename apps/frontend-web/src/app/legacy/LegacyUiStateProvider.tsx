import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ROLES } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';

/**
 * Estado de UI que en el export de Figma vivía dentro de `App()` y se pasaba
 * por props a varias pantallas (`sellerStatus`, alternancia cliente/vendedor).
 *
 * Vive aquí, aislado y marcado como temporal, para que el `App.tsx` real quede
 * limpio. Cada pieza desaparece cuando su módulo se integre de verdad:
 * `sellerStatus` lo dará el backend de onboarding de vendedor (Módulo 8) y
 * `mode` pasará a derivarse de los roles del usuario autenticado.
 *
 * TODO: Backend integration pending — eliminar este provider al cerrar el Módulo 8.
 */
interface LegacyUiState {
  sellerStatus: string;
  setSellerStatus: (status: string) => void;
  mode: string;
  setMode: (mode: string) => void;
}

const LegacyUiStateContext = createContext<LegacyUiState | null>(null);

export function LegacyUiStateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [sellerStatus, setSellerStatus] = useState('approved');
  const [mode, setMode] = useState('cliente');

  // El export arrancaba siempre en modo "vendedor". Ahora que hay sesión real,
  // el modo inicial se deriva de los roles: un cliente sin rol VENDEDOR no
  // debería aterrizar en el panel de vendedor.
  useEffect(() => {
    setMode(user?.roles.includes(ROLES.vendedor) ? 'vendedor' : 'cliente');
  }, [user]);

  const value = useMemo(
    () => ({ sellerStatus, setSellerStatus, mode, setMode }),
    [sellerStatus, mode],
  );

  return (
    <LegacyUiStateContext.Provider value={value}>{children}</LegacyUiStateContext.Provider>
  );
}

export function useLegacyUiState(): LegacyUiState {
  const context = useContext(LegacyUiStateContext);

  if (!context) {
    throw new Error('useLegacyUiState debe usarse dentro de <LegacyUiStateProvider>.');
  }

  return context;
}
