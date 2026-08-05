import { FileSearch } from 'lucide-react';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';

import { SellerRequestTable } from '../components/SellerRequestTable';
import { useSellerRequests } from '../hooks/useAdminSellerRequests';

/**
 * Cola de revisión de solicitudes de vendedor.
 *
 * La lista contiene solo lo que el solicitante ya envió: el backend filtra por
 * `estado = PENDIENTE` **y** `pasoActual = REVISION`, y ese paso lo escribe
 * únicamente `PATCH /seller/requests/:id/submit`. Los expedientes a medio
 * llenar no llegan aquí.
 */
export default function SellerRequestsPage() {
  const solicitudes = useSellerRequests();

  return (
    <div className="max-w-6xl">
      <header className="mb-6">
        <h2 className="text-xl font-black text-foreground mb-1">
          Solicitudes de vendedor
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Expedientes enviados a revisión. Aprobar crea el vendedor y le concede el rol;
          rechazar le devuelve el motivo que escribas. Ambas acciones son definitivas: una
          solicitud ya revisada no vuelve a la cola.
        </p>
      </header>

      <section className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-[#F5F6F8]/30">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-primary" />
            En espera de revisión
          </h3>

          {solicitudes.data && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md">
              {solicitudes.data.length}{' '}
              {solicitudes.data.length === 1 ? 'solicitud' : 'solicitudes'}
            </span>
          )}
        </div>

        {solicitudes.isLoading && (
          <div className="p-5 space-y-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-12 bg-[#F5F6F8] rounded animate-pulse" />
            ))}
          </div>
        )}

        {solicitudes.isError && (
          <div className="p-5">
            <ErrorState onRetry={() => solicitudes.refetch()} />
          </div>
        )}

        {solicitudes.data &&
          (solicitudes.data.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={FileSearch}
                title="No hay solicitudes en espera"
                description="Cuando alguien complete su expediente y lo envíe a revisión, aparecerá en esta cola."
              />
            </div>
          ) : (
            <SellerRequestTable solicitudes={solicitudes.data} />
          ))}
      </section>
    </div>
  );
}
