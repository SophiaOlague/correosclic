import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  MapPin,
  Package,
  Store,
  Truck,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import type { CourierDeliveryDto, RecordDeliveryAttemptRequest } from '@/types/logistics';

import { DeliveryAttemptForm } from '../components/DeliveryAttemptForm';
import { DeliveryAttemptList } from '../components/DeliveryAttemptList';
import { ShipmentStateBadge } from '../components/ShipmentStateBadge';
import { TrackingTimeline } from '../components/TrackingTimeline';
import { useMyDeliveries, useRecordDeliveryAttempt } from '../hooks/useDeliveries';
import { useShipment } from '../hooks/useShipments';
import { formatTrackingDate } from '../lib/shipment-states';

/**
 * Panel del repartidor.
 *
 * El export de Figma traía un mapa con la ruta dibujada, distancias y tiempos
 * estimados. Nada de eso existe: el backend no modela rutas de reparto ni
 * coordenadas de entrega, así que se sustituye por lo que sí hay —la lista de
 * entregas asignadas, el detalle del envío y el historial de intentos— en vez
 * de simular una navegación que no puede ser real.
 */
export default function DriverPage() {
  const { user } = useAuth();
  const [seleccionada, setSeleccionada] = useState<CourierDeliveryDto | null>(null);

  const { data: entregas, isLoading, isError, refetch } = useMyDeliveries();

  return (
    <div className="bg-[#F5F6F8] min-h-screen">
      <header className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/20 shrink-0">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-foreground leading-tight">Repartidor</h1>
              <p className="text-xs font-semibold text-muted-foreground">
                Mis entregas asignadas
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground bg-[#F5F6F8] px-4 py-2 rounded-full">
              <User className="w-4 h-4 text-primary" />
              {user.nombre} {user.apellidoPaterno}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {seleccionada ? (
          <DeliveryDetail
            entrega={seleccionada}
            onVolver={() => setSeleccionada(null)}
            onCompletada={() => setSeleccionada(null)}
          />
        ) : (
          <>
            <h2 className="text-2xl font-black text-foreground mb-6">Entregas asignadas</h2>

            {isLoading && (
              <div className="space-y-4">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="h-[104px] bg-white rounded-2xl border border-border animate-pulse"
                  />
                ))}
              </div>
            )}

            {isError && (
              <ErrorState
                title="No pudimos cargar tus entregas"
                description="Si tu usuario no está dado de alta como repartidor activo, este panel no tendrá contenido."
                onRetry={() => refetch()}
              />
            )}

            {entregas && entregas.length === 0 && (
              <EmptyState
                icon={Package}
                title="No tienes entregas asignadas"
                description="El motor de CorreosClic te asignará paquetes automáticamente cuando lleguen a tu sucursal y haya capacidad en tu vehículo."
                action={
                  <Link
                    to={ROUTES.home}
                    className="bg-primary text-white px-6 h-11 inline-flex items-center rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
                  >
                    Volver al inicio
                  </Link>
                }
              />
            )}

            {entregas && entregas.length > 0 && (
              <div className="space-y-4">
                {entregas.map((entrega) => (
                  <button
                    key={entrega.entregaId}
                    onClick={() => setSeleccionada(entrega)}
                    className="w-full text-left bg-white rounded-2xl border border-border p-5 shadow-sm flex items-center gap-4 hover:border-primary/30 transition-colors group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#F5F6F8] flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-sm font-black text-foreground font-mono">
                          {entrega.trackingInterno}
                        </p>
                        <ShipmentStateBadge estado={entrega.estado} size="sm" />
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground">
                        Asignada el {formatTrackingDate(entrega.fechaAsignacion)}
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/**
 * Detalle de una entrega. El resumen de la lista solo trae cinco campos, así
 * que el resto —sucursales, peso, historial e intentos previos— se pide a
 * `GET /logistics/shipments/:id`, que admite al repartidor asignado.
 */
function DeliveryDetail({
  entrega,
  onVolver,
  onCompletada,
}: {
  entrega: CourierDeliveryDto;
  onVolver: () => void;
  onCompletada: () => void;
}) {
  const [formulario, setFormulario] = useState<'entrega' | 'fallido' | null>(null);

  const { data: envio, isLoading, isError, refetch } = useShipment(entrega.envioId);

  const registrarIntento = useRecordDeliveryAttempt((actualizado) => {
    setFormulario(null);

    // El envío sale de la lista de asignadas cuando se entrega o se devuelve.
    if (actualizado.estado === 'ENTREGADO' || actualizado.estado === 'DEVUELTO') {
      onCompletada();
    }
  });

  const enviar = (body: RecordDeliveryAttemptRequest) =>
    registrarIntento.mutate({ entregaId: entrega.entregaId, body });

  /**
   * Registrar un intento solo es válido con el envío en `EN_REPARTO`; fuera de
   * ese estado el backend responde 409. La lista ya viene filtrada así, pero el
   * estado puede haber avanzado entre que se cargó la pantalla y se abre el
   * detalle, así que se comprueba contra el envío recién leído.
   */
  const enReparto = (envio?.estado ?? entrega.estado) === 'EN_REPARTO';

  return (
    <div>
      <button
        onClick={onVolver}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4" /> Volver a mis entregas
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-foreground font-mono">
            {entrega.trackingInterno}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Asignada el {formatTrackingDate(entrega.fechaAsignacion)}
          </p>
        </div>
        <ShipmentStateBadge estado={envio?.estado ?? entrega.estado} />
      </div>

      {/* Solo se puede registrar un intento mientras el envío siga EN_REPARTO:
          fuera de ese estado el backend responde 409. */}
      {!enReparto && (
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Esta entrega ya está cerrada y no admite más intentos. Puedes consultar su
            historial abajo.
          </p>
        </div>
      )}

      {enReparto &&
        (formulario ? (
          <DeliveryAttemptForm
            trackingInterno={entrega.trackingInterno}
            modo={formulario}
            isPending={registrarIntento.isPending}
            onCancel={() => setFormulario(null)}
            onSubmit={enviar}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setFormulario('entrega')}
              className="bg-[#006847] text-white h-16 rounded-2xl font-black text-lg hover:bg-[#005439] transition-colors shadow-lg shadow-[#006847]/25 flex items-center justify-center gap-2"
            >
              <CheckSquare className="w-6 h-6" /> Confirmar entrega
            </button>

            <button
              onClick={() => setFormulario('fallido')}
              className="bg-white border-2 border-border text-foreground h-16 rounded-2xl font-bold hover:bg-[#F5F6F8] transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" /> Intento fallido
            </button>
          </div>
        ))}

      {isLoading && (
        <div className="space-y-4 mt-6">
          <div className="h-32 bg-white rounded-2xl border border-border animate-pulse" />
          <div className="h-64 bg-white rounded-2xl border border-border animate-pulse" />
        </div>
      )}

      {isError && (
        <div className="mt-6">
          <ErrorState
            title="No pudimos cargar el detalle del envío"
            description="Puedes seguir registrando el intento: la acción no depende de esta consulta."
            onRetry={() => refetch()}
          />
        </div>
      )}

      {envio && (
        <div className="space-y-4 mt-6">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="font-bold text-foreground mb-4">Datos del envío</h3>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2.5">
                <Store className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-muted-foreground">Sucursal de origen</dt>
                  <dd className="font-bold text-foreground">{envio.sucursalOrigen.nombre}</dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-muted-foreground">Sucursal de destino</dt>
                  <dd className="font-bold text-foreground">{envio.sucursalDestino.nombre}</dd>
                </div>
              </div>

              {envio.pesoRealKg !== null && (
                <div className="flex items-start gap-2.5">
                  <Package className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Peso verificado</dt>
                    <dd className="font-bold text-foreground">{envio.pesoRealKg} kg</dd>
                  </div>
                </div>
              )}

              {envio.distanciaKm !== null && (
                <div className="flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Distancia del envío</dt>
                    <dd className="font-bold text-foreground">
                      {envio.distanciaKm.toFixed(1)} km
                    </dd>
                  </div>
                </div>
              )}
            </dl>

            {/* El domicilio del destinatario pertenece a Orders y Logistics no
                lo expone: el repartidor lo consulta en la guía física. */}
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="font-bold text-foreground mb-4">Historial de intentos</h3>
            <DeliveryAttemptList intentos={envio.entrega?.intentos ?? []} />
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="font-bold text-foreground mb-5">Historial del envío</h3>
            <TrackingTimeline eventos={envio.historial} />
          </div>
        </div>
      )}
    </div>
  );
}
