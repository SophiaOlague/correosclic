import { Building } from 'lucide-react';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';

import { BranchTable } from '../components/BranchTable';
import { useAdminBranches } from '../hooks/useAdminOperations';

/**
 * Sucursales de la red — `GET /admin/branches`.
 *
 * Es una lectura y nada más: el backend no expone alta, edición ni baja de
 * sucursales, así que la pantalla no ofrece acciones que no existan.
 */
export default function BranchesPage() {
  const sucursales = useAdminBranches();

  return (
    <div className="max-w-6xl">
      <header className="mb-6">
        <h2 className="text-xl font-black text-foreground mb-1">Sucursales</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Puntos de la red donde se reciben, clasifican y despachan los envíos. El motor
          logístico elige entre ellas por cercanía; desde aquí solo se consultan.
        </p>
      </header>

      <section className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-[#F5F6F8]/30">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            Red de sucursales
          </h3>

          {sucursales.data && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md">
              {sucursales.data.length}{' '}
              {sucursales.data.length === 1 ? 'sucursal' : 'sucursales'}
            </span>
          )}
        </div>

        {sucursales.isLoading && (
          <div className="p-5 space-y-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-12 bg-[#F5F6F8] rounded animate-pulse" />
            ))}
          </div>
        )}

        {sucursales.isError && (
          <div className="p-5">
            <ErrorState onRetry={() => sucursales.refetch()} />
          </div>
        )}

        {sucursales.data &&
          (sucursales.data.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Building}
                title="No hay sucursales registradas"
                description="Sin sucursales, el motor logístico no puede planificar ninguna ruta."
              />
            </div>
          ) : (
            <BranchTable sucursales={sucursales.data} />
          ))}
      </section>
    </div>
  );
}
