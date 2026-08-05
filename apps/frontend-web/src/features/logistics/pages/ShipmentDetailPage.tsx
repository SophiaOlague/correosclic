import { ArrowLeft, ChevronRight, Copy, MapPin, Package, Store, Truck } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { toast } from 'sonner';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';
import { ApiError } from '@/services/http';

import { DeliveryAttemptList } from '../components/DeliveryAttemptList';
import { ShipmentStateBadge } from '../components/ShipmentStateBadge';
import { TrackingTimeline } from '../components/TrackingTimeline';
import { useShipment } from '../hooks/useShipments';
import { formatTrackingDay, shipmentStateVisual } from '../lib/shipment-states';

/**
 * Detalle de un envío — `GET /logistics/shipments/:id`.
 *
 * Sustituye a la pantalla de rastreo del export de Figma, que dibujaba siete
 * pasos fijos con fechas inventadas. Conserva su composición —resumen a la
 * izquierda, línea de tiempo a la derecha— pero cada dato sale del backend.
 *
 * La misma pantalla la abren el cliente, el vendedor y el repartidor asignado:
 * el endpoint devuelve el mismo DTO para los tres y responde 404 a cualquier
 * otro, así que aquí no hace falta ninguna comprobación de propiedad.
 */
export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: envio, isLoading, isError, error, refetch } = useShipment(id);

  if (isLoading) return <ShipmentDetailSkeleton />;

  if (isError) {
    const notFound = error instanceof ApiError && error.isNotFound;

    return (
      <main className="bg-[#F5F6F8] min-h-[60vh] py-16">
        <div className="max-w-2xl mx-auto px-4">
          {notFound ? (
            <EmptyState
              icon={Package}
              title="No encontramos este envío"
              description="Puede que el enlace sea incorrecto o que el envío no esté asociado a tu cuenta."
              action={
                <Link
                  to={ROUTES.orders}
                  className="bg-primary text-white px-6 h-11 inline-flex items-center rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
                >
                  Ver mis pedidos
                </Link>
              }
            />
          ) : (
            <ErrorState onRetry={() => refetch()} />
          )}
        </div>
      </main>
    );
  }

  if (!envio) return null;

  const { description } = shipmentStateVisual(envio.estado);

  const copiarGuia = () => {
    navigator.clipboard
      .writeText(envio.trackingInterno)
      .then(() => toast.success('Número de guía copiado'))
      .catch(() => toast.error('No pudimos copiar el número de guía'));
  };

  return (
    <main className="bg-[#F5F6F8] min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <nav aria-label="Ruta" className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to={ROUTES.home} className="hover:text-foreground">
            Inicio
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={ROUTES.orders} className="hover:text-foreground">
            Mis pedidos
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-semibold">Seguimiento</span>
        </nav>

        <Link
          to={ROUTES.orders}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a mis pedidos
        </Link>

        <h1 className="text-2xl lg:text-3xl font-black text-foreground mb-8">
          Rastreo de envío
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="md:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-3">
                Detalles del envío
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Guía CorreosClic</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black text-foreground font-mono bg-[#F5F6F8] px-3 py-1.5 rounded-lg">
                      {envio.trackingInterno}
                    </p>
                    <button
                      onClick={copiarGuia}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Copy className="w-3 h-3" /> Copiar
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <p className="text-xs text-muted-foreground mb-1.5">Estado actual</p>
                  <ShipmentStateBadge estado={envio.estado} />
                  {description && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>

                {/* Fechas: solo las que el backend devuelve. `fechaEntregaEstimada`
                    hoy no la escribe nadie, así que normalmente no aparece. */}
                {envio.fechaEntregaReal && (
                  <div className="pt-1">
                    <p className="text-xs text-muted-foreground mb-1">Entregado</p>
                    <p className="text-sm font-bold text-[#006847]">
                      {formatTrackingDay(envio.fechaEntregaReal)}
                    </p>
                  </div>
                )}

                {!envio.fechaEntregaReal && envio.fechaEntregaEstimada && (
                  <div className="pt-1">
                    <p className="text-xs text-muted-foreground mb-1">Entrega estimada</p>
                    <p className="text-sm font-bold text-foreground">
                      {formatTrackingDay(envio.fechaEntregaEstimada)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#006847]/5 border border-[#006847]/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-[#006847]" />
                <h3 className="font-bold text-[#006847] text-sm">Ruta del paquete</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <Store className="w-4 h-4 text-[#006847]/70 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#006847]/70">Sucursal de origen</p>
                    <p className="font-bold text-[#006847]">{envio.sucursalOrigen.nombre}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#006847]/70 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#006847]/70">Sucursal de destino</p>
                    <p className="font-bold text-[#006847]">{envio.sucursalDestino.nombre}</p>
                  </div>
                </div>

                {envio.distanciaKm !== null && (
                  <p className="text-xs font-semibold text-[#006847]/80 pt-1 border-t border-[#006847]/10">
                    Distancia: {envio.distanciaKm.toFixed(1)} km
                  </p>
                )}

                {envio.pesoRealKg !== null && (
                  <p className="text-xs font-semibold text-[#006847]/80">
                    Peso verificado: {envio.pesoRealKg} kg
                  </p>
                )}
              </div>
            </div>

            {/* Transferencia troncal: solo existe si el envío cruzó de sucursal. */}
            {envio.transferencias.length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" /> Transferencia entre sucursales
                </h3>

                <ul className="space-y-2.5">
                  {envio.transferencias.map((transferencia) => (
                    <li key={transferencia.id} className="text-sm">
                      <p className="text-muted-foreground">
                        Salida: {formatTrackingDay(transferencia.fechaSalida)}
                      </p>
                      <p
                        className={
                          transferencia.fechaLlegada
                            ? 'font-semibold text-[#006847]'
                            : 'font-semibold text-muted-foreground'
                        }
                      >
                        {transferencia.fechaLlegada
                          ? `Llegada: ${formatTrackingDay(transferencia.fechaLlegada)}`
                          : 'En tránsito'}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-6">
                Historial de movimientos
              </h2>

              <TrackingTimeline eventos={envio.historial} />
            </div>

            {envio.entrega && (
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Intentos de entrega
                </h2>

                {envio.entrega.nombreRecibe && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Recibido por{' '}
                    <span className="font-bold text-foreground">
                      {envio.entrega.nombreRecibe}
                    </span>
                  </p>
                )}

                <DeliveryAttemptList intentos={envio.entrega.intentos} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function ShipmentDetailSkeleton() {
  return (
    <main className="bg-[#F5F6F8] min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-4 w-64 bg-white rounded animate-pulse mb-6" />
        <div className="h-9 w-72 bg-white rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="md:col-span-1 space-y-5">
            <div className="h-64 bg-white rounded-2xl border border-border animate-pulse" />
            <div className="h-44 bg-white rounded-2xl border border-border animate-pulse" />
          </div>
          <div className="md:col-span-2">
            <div className="h-96 bg-white rounded-2xl border border-border animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
