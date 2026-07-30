import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { LegacyUiStateProvider } from '@/app/legacy/LegacyUiStateProvider';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';

/**
 * Único punto de montaje de los providers globales.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <LegacyUiStateProvider>
          {children}
          <Toaster position="top-right" richColors />
        </LegacyUiStateProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
