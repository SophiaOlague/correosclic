import { ChevronRight, PackageCheck, Store } from 'lucide-react';
import { Link } from 'react-router';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';

import { ShipmentStateBadge } from '../components/ShipmentStateBadge';
import { useVendorPendingShipments } from '../hooks/useShipments';
import { formatTrackingDate } from '../lib/shipment-states';

/**
 * Envíos pendientes de entregar en sucursal — `GET /logistics/vendors/me/pending-shipments`.
 *
 * El endpoint devuelve **solo** los envíos en `PENDIENTE_RECEPCION`: en cuanto
 * la sucursal certifica la recepción, el envío sale de esta lista. Por eso la
 * pantalla se titula por lo que realmente contiene y no como un "mis envíos"
 * general, que no existe en el backend.
 *
 * La sucursal de origen y el detalle del tracking no vienen en el resumen: se
 * consultan por envío en `GET /logistics/shipments/:id`, al que el vendedor sí
 * tiene acceso.
 */
export default function VendorShipmentsPage() {
  const { data: envios, isLoading, isError, refetch } = useVendorPendingShipments();

  return (
    <main className="bg-[#F5F6F8] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <nav aria-label="Ruta" className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to={ROUTES.sellerDashboard} className="hover:text-foreground">
            Vendedor
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-semibold">Envíos por entregar</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-black text-foreground mb-2">
            Envíos por entregar en sucursal
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Estas guías ya están generadas y esperan a que lleves el paquete a tu sucursal de
            origen. En cuanto la sucursal certifique la recepción, el envío sale de esta lista y
            el resto del trayecto lo gestiona CorreosClic.
          </p>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-[92px] bg-white rounded-2xl border border-border animate-pulse"
              />
            ))}
          </div>
        )}

        {isError && <ErrorState onRetry={() => refetch()} />}

        {envios && envios.length === 0 && (
          <EmptyState
            icon={PackageCheck}
            title="No tienes envíos pendientes"
            description="Cuando un pedido tuyo se pague, aparecerá aquí la guía que debes llevar a tu sucursal."
          />
        )}

        {envios && envios.length > 0 && (
          <div className="space-y-3">
            {envios.map((envio) => (
              <Link
                key={envio.id}
                to={`${ROUTES.shipment}/${envio.id}`}
                className="bg-white rounded-2xl border border-border p-5 shadow-sm flex items-center gap-4 hover:border-primary/30 transition-colors group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#F5F6F8] flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-sm font-black text-foreground font-mono">
                      {envio.trackingInterno}
                    </p>
                    <ShipmentStateBadge estado={envio.estado} size="sm" />
                  </div>

                  {envio.createdAt && (
                    <p className="text-xs font-semibold text-muted-foreground">
                      Guía generada el {formatTrackingDate(envio.createdAt)}
                    </p>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
