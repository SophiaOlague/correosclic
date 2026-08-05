import type { AdminVehicleDto } from '@/types/admin';
import { formatNumber } from '@/utils/format';

import { ActiveBadge } from './ActiveBadge';

/**
 * Vehículos de la red. Solo lectura, igual que las sucursales.
 *
 * `repartidorAsignado` sale de la asignación vigente del vehículo; el motor de
 * planificación es quien la resuelve, aquí no se elige nada.
 */
export function VehicleTable({ vehiculos }: { vehiculos: AdminVehicleDto[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-[#F5F6F8]/50">
            <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Placas
            </th>
            <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Vehículo
            </th>
            <th className="text-right font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Capacidad
            </th>
            <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Sucursal
            </th>
            <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Repartidor asignado
            </th>
            <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Estado
            </th>
          </tr>
        </thead>

        <tbody>
          {vehiculos.map((vehiculo) => (
            <tr
              key={vehiculo.id}
              className="border-b border-border last:border-0 hover:bg-[#F5F6F8]/60 transition-colors"
            >
              <td className="px-6 py-4 font-mono font-bold text-foreground">
                {vehiculo.placas}
              </td>

              <td className="px-6 py-4">
                <p className="font-semibold text-foreground">
                  {vehiculo.marca} {vehiculo.modelo}
                </p>
                <p className="text-xs text-muted-foreground">{vehiculo.anio}</p>
              </td>

              <td className="px-6 py-4 text-right font-bold text-foreground whitespace-nowrap">
                {formatNumber(vehiculo.capacidadKg)} kg
              </td>

              <td className="px-6 py-4 text-foreground">{vehiculo.sucursal.nombre}</td>

              <td className="px-6 py-4">
                {vehiculo.repartidorAsignado ?? (
                  <span className="text-muted-foreground">Sin asignar</span>
                )}
              </td>

              <td className="px-6 py-4">
                <ActiveBadge
                  activo={vehiculo.activo}
                  etiquetas={{ si: 'Activo', no: 'Inactivo' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
