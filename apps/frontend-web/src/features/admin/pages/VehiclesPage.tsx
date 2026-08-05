import { Car } from 'lucide-react';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';

import { VehicleTable } from '../components/VehicleTable';
import { useAdminVehicles } from '../hooks/useAdminOperations';

/**
 * Flota — `GET /admin/vehicles`.
 *
 * Solo lectura. La capacidad en kilogramos importa porque es lo que consulta
 * el motor al planificar una transferencia: si ningún vehículo de la sucursal
 * tiene capacidad suficiente, el envío se queda en la cola de despacho.
 */
export default function VehiclesPage() {
  const vehiculos = useAdminVehicles();

  return (
    <div className="max-w-6xl">
      <header className="mb-6">
        <h2 className="text-xl font-black text-foreground mb-1">Vehículos</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Flota de la red, con su sucursal y el repartidor que la tiene asignada. La
          asignación a cada transferencia la resuelve el motor logístico; desde aquí solo
          se consulta.
        </p>
      </header>

      <section className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-[#F5F6F8]/30">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Car className="w-4 h-4 text-primary" />
            Flota registrada
          </h3>

          {vehiculos.data && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md">
              {vehiculos.data.length}{' '}
              {vehiculos.data.length === 1 ? 'vehículo' : 'vehículos'}
            </span>
          )}
        </div>

        {vehiculos.isLoading && (
          <div className="p-5 space-y-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-12 bg-[#F5F6F8] rounded animate-pulse" />
            ))}
          </div>
        )}

        {vehiculos.isError && (
          <div className="p-5">
            <ErrorState onRetry={() => vehiculos.refetch()} />
          </div>
        )}

        {vehiculos.data &&
          (vehiculos.data.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Car}
                title="No hay vehículos registrados"
                description="Sin flota, las transferencias entre sucursales se quedan esperando en la cola de despacho."
              />
            </div>
          ) : (
            <VehicleTable vehiculos={vehiculos.data} />
          ))}
      </section>
    </div>
  );
}
