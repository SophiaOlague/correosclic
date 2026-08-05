import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

import { ROUTES } from '@/constants/routes';
import type { PendingSellerRequestDto } from '@/types/admin';

import { formatAdminDate } from '../lib/admin-format';

/**
 * Cola de solicitudes pendientes.
 *
 * `GET /admin/seller-requests` no está paginado ni admite filtros, así que la
 * tabla muestra la lista completa tal como llega, ordenada por el backend de
 * la más antigua a la más reciente.
 */
export function SellerRequestTable({
  solicitudes,
}: {
  solicitudes: PendingSellerRequestDto[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-[#F5F6F8]/50">
            <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Solicitante
            </th>
            <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              RFC
            </th>
            <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Expediente
            </th>
            <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Enviada
            </th>
            <th className="px-6 py-3" />
          </tr>
        </thead>

        <tbody>
          {solicitudes.map((solicitud) => (
            <tr
              key={solicitud.id}
              className="border-b border-border last:border-0 hover:bg-[#F5F6F8]/60 transition-colors"
            >
              <td className="px-6 py-4 font-semibold text-foreground">
                {solicitud.nombreCompleto}
              </td>

              <td className="px-6 py-4 font-mono text-foreground">
                {/* El backend manda cadena vacía si no hay información fiscal. */}
                {solicitud.rfc || (
                  <span className="font-sans text-muted-foreground">Sin registrar</span>
                )}
              </td>

              <td className="px-6 py-4">
                {solicitud.documentosCompletos ? (
                  <span className="inline-flex items-center gap-1.5 bg-[#006847]/10 text-[#006847] text-xs font-bold px-2.5 py-1 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />3 documentos
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Incompleto
                  </span>
                )}
              </td>

              <td className="px-6 py-4 text-muted-foreground">
                {formatAdminDate(solicitud.fechaSolicitud)}
              </td>

              <td className="px-6 py-4 text-right">
                <Link
                  to={`${ROUTES.adminSellerRequests}/${solicitud.id}`}
                  className="inline-flex items-center gap-1 bg-primary text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
                >
                  Revisar
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
