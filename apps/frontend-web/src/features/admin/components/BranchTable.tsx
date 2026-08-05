import type { AdminBranchDto } from '@/types/admin';

import { ActiveBadge } from './ActiveBadge';

/**
 * Sucursales de la red. Solo lectura: `admin/` no expone alta, edición ni
 * baja, así que la tabla no ofrece ninguna acción.
 */
export function BranchTable({ sucursales }: { sucursales: AdminBranchDto[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-[#F5F6F8]/50">
            <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Sucursal
            </th>
            <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Ubicación
            </th>
            <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Contacto
            </th>
            <th className="text-right font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Empleados
            </th>
            <th className="text-right font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Vehículos
            </th>
            <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Estado
            </th>
          </tr>
        </thead>

        <tbody>
          {sucursales.map((sucursal) => (
            <tr
              key={sucursal.id}
              className="border-b border-border last:border-0 hover:bg-[#F5F6F8]/60 transition-colors"
            >
              <td className="px-6 py-4">
                <p className="font-semibold text-foreground">{sucursal.nombre}</p>
                <p className="text-xs font-mono text-muted-foreground">{sucursal.codigo}</p>
              </td>

              <td className="px-6 py-4">
                <p className="text-foreground">
                  {sucursal.ciudad}, {sucursal.estado}
                </p>
                {/* `direccionFormateada` es nula en el DTO: si falta, se omite. */}
                {sucursal.direccionFormateada && (
                  <p className="text-xs text-muted-foreground">
                    {sucursal.direccionFormateada}
                  </p>
                )}
              </td>

              <td className="px-6 py-4">
                {sucursal.telefono || sucursal.email ? (
                  <>
                    {sucursal.telefono && (
                      <p className="text-foreground">{sucursal.telefono}</p>
                    )}
                    {sucursal.email && (
                      <p className="text-xs text-muted-foreground">{sucursal.email}</p>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>

              <td className="px-6 py-4 text-right font-bold text-foreground">
                {sucursal.totalEmpleados}
              </td>

              <td className="px-6 py-4 text-right font-bold text-foreground">
                {sucursal.totalVehiculos}
              </td>

              <td className="px-6 py-4">
                <ActiveBadge
                  activo={sucursal.activa}
                  etiquetas={{ si: 'Activa', no: 'Inactiva' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
