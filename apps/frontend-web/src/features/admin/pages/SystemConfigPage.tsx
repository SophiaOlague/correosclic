import { AlertTriangle, Settings } from 'lucide-react';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import type { SystemConfigEntryDto } from '@/types/admin';

import { SystemConfigCard } from '../components/SystemConfigCard';
import { useSystemConfig, useUpdateSystemConfig } from '../hooks/useAdminOperations';
import { SYSTEM_CONFIG_ORDER } from '../lib/system-config';

/**
 * Configuración del sistema — `GET /admin/system-config` y
 * `PATCH /admin/system-config/:clave`.
 *
 * Cada guardado escribe en la misma fila que los servicios leen en cada
 * petición: no hay caché ni despliegue de por medio. El aviso de la cabecera
 * no es decorativo, es el comportamiento real.
 */
export default function SystemConfigPage() {
  const configuracion = useSystemConfig();
  const actualizar = useUpdateSystemConfig();

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h2 className="text-xl font-black text-foreground mb-1">Configuración del sistema</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Las claves que el dominio declara en <code>ConfiguracionSistemaKey</code>. Son
          las únicas que el backend devuelve y acepta: cualquier otra responde 404.
        </p>
      </header>

      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900 leading-relaxed">
          <p className="font-bold mb-1">Estos valores afectan cálculos en vivo.</p>
          <p>
            La comisión del marketplace y el IVA entran en el importe de cada pedido que se
            cotice a partir del guardado; la aportación de vendedores adicionales cambia el
            costo de envío multivendedor, y el máximo de intentos decide cuándo se devuelve
            un envío. No hay confirmación en dos pasos ni historial de cambios: el valor
            anterior se pierde.
          </p>
        </div>
      </div>

      {configuracion.isLoading && (
        <div className="space-y-4">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-40 bg-white rounded-2xl border border-border animate-pulse"
            />
          ))}
        </div>
      )}

      {configuracion.isError && <ErrorState onRetry={() => configuracion.refetch()} />}

      {configuracion.data &&
        (configuracion.data.length === 0 ? (
          <EmptyState
            icon={Settings}
            title="No hay configuración registrada"
            description="La base de datos no tiene ninguna de las claves que el dominio declara."
          />
        ) : (
          <div className="space-y-4">
            {ordenar(configuracion.data).map((entrada) => (
              <SystemConfigCard
                key={entrada.clave}
                entrada={entrada}
                // La mutación es una sola: sin esto, guardar una clave dejaría
                // en espera los botones de todas las demás.
                isPending={
                  actualizar.isPending && actualizar.variables?.clave === entrada.clave
                }
                onSave={(valor) => actualizar.mutateAsync({ clave: entrada.clave, valor })}
              />
            ))}
          </div>
        ))}
    </div>
  );
}

/**
 * Primero las claves que sí mueven un cálculo hoy. Las que el backend no lee
 * todavía se muestran igual —existen y son editables— pero al final, y
 * cualquier clave que el frontend no conozca se conserva al fondo en vez de
 * desaparecer.
 */
function ordenar(entradas: SystemConfigEntryDto[]): SystemConfigEntryDto[] {
  const posicion = (clave: string) => {
    const indice = SYSTEM_CONFIG_ORDER.indexOf(clave as (typeof SYSTEM_CONFIG_ORDER)[number]);

    return indice === -1 ? SYSTEM_CONFIG_ORDER.length : indice;
  };

  return [...entradas].sort((a, b) => posicion(a.clave) - posicion(b.clave));
}
