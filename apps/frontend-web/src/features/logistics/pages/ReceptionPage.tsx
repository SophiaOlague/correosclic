import {
  CheckCircle,
  Inbox,
  Loader2,
  PackageCheck,
  ScanLine,
  Search,
  Truck,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import type { ShipmentDetailDto } from '@/types/logistics';

import { BranchQueueTable } from '../components/BranchQueueTable';
import { ReceptionChecklist, type ReceptionSubmission } from '../components/ReceptionChecklist';
import { ShipmentStateBadge } from '../components/ShipmentStateBadge';
import { TrackingTimeline } from '../components/TrackingTimeline';
import {
  useConfirmReception,
  useDispatchQueue,
  useMyBranch,
  useReceptionQueue,
  useRetryPlanning,
} from '../hooks/useReception';
import { shipmentStateVisual } from '../lib/shipment-states';

/**
 * Panel de recepción en sucursal.
 *
 * Conserva la composición del export de Figma —barra de escaneo, cola de
 * pendientes, checklist y pantalla de confirmación— sobre el contrato real.
 *
 * **El recepcionista únicamente certifica la recepción.** No elige ruta, ni
 * clasificación, ni vehículo, ni repartidor: todo eso lo resuelve el motor del
 * backend en la misma petición, y por eso la pantalla de confirmación muestra
 * el estado en el que quedó el envío —que puede ser ya `EN_TRANSITO` o
 * `EN_REPARTO`— en vez de anunciar un paso siguiente que no le corresponde
 * decidir.
 */
type Vista =
  | { tipo: 'cola' }
  | { tipo: 'verificacion'; trackingInterno: string }
  | { tipo: 'confirmado'; envio: ShipmentDetailDto };

export default function ReceptionPage() {
  const { user } = useAuth();
  const [vista, setVista] = useState<Vista>({ tipo: 'cola' });
  const [codigo, setCodigo] = useState('');

  const sucursal = useMyBranch();
  const sucursalId = sucursal.data?.sucursalId;

  const recepcion = useReceptionQueue(sucursalId);
  const despacho = useDispatchQueue(sucursalId);

  const confirmarRecepcion = useConfirmReception((envio) => {
    setCodigo('');
    setVista({ tipo: 'confirmado', envio });
  });

  const reintentarPlanificacion = useRetryPlanning();

  const procesar = (trackingInterno: string) =>
    setVista({ tipo: 'verificacion', trackingInterno: trackingInterno.trim() });

  const enviar = (submission: ReceptionSubmission) => {
    if (vista.tipo !== 'verificacion') return;

    confirmarRecepcion.mutate({
      trackingInterno: vista.trackingInterno,
      resultado: submission.resultado,
      observaciones: submission.observaciones,
      pesoRealKg: submission.pesoRealKg,
    });
  };

  return (
    <div className="bg-[#F5F6F8] min-h-screen">
      <header className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/20 shrink-0">
              <PackageCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-foreground leading-tight">Recepción</h1>
              {sucursal.isLoading ? (
                <span className="block h-4 w-40 bg-[#F5F6F8] rounded animate-pulse mt-1" />
              ) : (
                sucursal.data && (
                  <p className="text-xs font-semibold text-muted-foreground">
                    {sucursal.data.nombre} · {sucursal.data.codigo}
                  </p>
                )
              )}
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground bg-[#F5F6F8] px-4 py-2 rounded-full">
              <User className="w-4 h-4 text-primary" />
              {user.nombre} {user.apellidoPaterno}
              {sucursal.data && (
                <span className="text-muted-foreground/70">· {sucursal.data.puesto}</span>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Sin sucursal no hay panel: todas las operaciones se acotan a ella. */}
        {sucursal.isError && (
          <EmptyState
            icon={PackageCheck}
            title="Tu usuario no está asignado a una sucursal"
            description="El panel de recepción solo está disponible para empleados activos con una sucursal asignada. Habla con tu administrador si crees que es un error."
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

        {sucursal.data && vista.tipo === 'cola' && (
          <div className="space-y-6">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (codigo.trim()) procesar(codigo);
              }}
              className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col md:flex-row items-center gap-4"
            >
              <div className="flex-1 w-full relative">
                <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={codigo}
                  onChange={(event) => setCodigo(event.target.value)}
                  placeholder="Escanea o escribe la guía CorreosClic..."
                  aria-label="Guía CorreosClic"
                  autoFocus
                  className="w-full h-14 bg-[#F5F6F8] border-2 border-transparent focus:border-primary focus:bg-white rounded-xl pl-12 pr-4 text-base font-medium outline-none transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={codigo.trim().length === 0}
                className="w-full md:w-auto bg-primary text-white px-8 h-14 rounded-xl font-bold hover:bg-[#C4006A] transition-colors shadow-lg shadow-primary/25 flex items-center justify-center gap-2 text-lg shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Search className="w-5 h-5" /> Buscar
              </button>
            </form>

            <section className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-5 border-b border-border flex flex-wrap justify-between items-center gap-3 bg-[#F5F6F8]/30">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-primary" />
                  Paquetes en espera de recepción
                </h2>
                {recepcion.data && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-md">
                    {recepcion.data.length} pendientes
                  </span>
                )}
              </div>

              {recepcion.isLoading && (
                <div className="p-5 space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="h-10 bg-[#F5F6F8] rounded animate-pulse" />
                  ))}
                </div>
              )}

              {recepcion.isError && (
                <div className="p-5">
                  <ErrorState onRetry={() => recepcion.refetch()} />
                </div>
              )}

              {recepcion.data && (
                <BranchQueueTable
                  envios={recepcion.data}
                  emptyMessage="No hay paquetes esperando recepción en tu sucursal."
                  renderAction={(envio) => (
                    <button
                      onClick={() => procesar(envio.trackingInterno)}
                      className="bg-[#006847] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#005439] transition-colors shadow-sm"
                    >
                      Procesar
                    </button>
                  )}
                />
              )}
            </section>

            <section className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-5 border-b border-border bg-[#F5F6F8]/30">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  Clasificados en espera de vehículo
                </h2>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Estos paquetes ya se clasificaron pero el motor no encontró un vehículo con
                  capacidad suficiente para su transferencia. Reintentar vuelve a pedirle al
                  backend que planifique: no elige vehículo ni ruta.
                </p>
              </div>

              {despacho.isLoading && (
                <div className="p-5 space-y-3">
                  {[0, 1].map((index) => (
                    <div key={index} className="h-10 bg-[#F5F6F8] rounded animate-pulse" />
                  ))}
                </div>
              )}

              {despacho.isError && (
                <div className="p-5">
                  <ErrorState onRetry={() => despacho.refetch()} />
                </div>
              )}

              {despacho.data && (
                <BranchQueueTable
                  envios={despacho.data}
                  emptyMessage="No hay paquetes clasificados esperando vehículo."
                  renderAction={(envio) => (
                    <button
                      onClick={() => reintentarPlanificacion.mutate(envio.id)}
                      disabled={reintentarPlanificacion.isPending}
                      className="bg-white border-2 border-border text-foreground px-5 py-2 rounded-lg font-bold hover:bg-[#F5F6F8] transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {reintentarPlanificacion.isPending && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Reintentar
                    </button>
                  )}
                />
              )}
            </section>
          </div>
        )}

        {sucursal.data && vista.tipo === 'verificacion' && (
          <ReceptionChecklist
            trackingInterno={vista.trackingInterno}
            isPending={confirmarRecepcion.isPending}
            onCancel={() => setVista({ tipo: 'cola' })}
            onSubmit={enviar}
          />
        )}

        {sucursal.data && vista.tipo === 'confirmado' && (
          <ReceptionConfirmed
            envio={vista.envio}
            onContinuar={() => setVista({ tipo: 'cola' })}
          />
        )}
      </main>
    </div>
  );
}

/**
 * Confirmación. Muestra el estado real en el que quedó el envío tras el
 * encadenamiento del orquestador, en vez del "listo para asignación" del
 * diseño: quién lo asigna y cuándo ya lo decidió el backend.
 */
function ReceptionConfirmed({
  envio,
  onContinuar,
}: {
  envio: ShipmentDetailDto;
  onContinuar: () => void;
}) {
  const { description } = shipmentStateVisual(envio.estado);
  const conIncidencia = envio.estado === 'DANADO' || envio.estado === 'CANCELADO';

  return (
    <div className="max-w-md mx-auto mt-10 text-center">
      <div
        className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 relative ${
          conIncidencia ? 'bg-destructive/10 text-destructive' : 'bg-[#006847]/10 text-[#006847]'
        }`}
      >
        {!conIncidencia && (
          <div className="absolute inset-0 border-4 border-[#006847] rounded-full animate-ping opacity-20" />
        )}
        <CheckCircle className="w-14 h-14" />
      </div>

      <h2 className="text-3xl font-black text-foreground mb-3">
        {conIncidencia ? 'Incidencia registrada' : 'Paquete recibido'}
      </h2>

      <p className="text-sm font-black text-foreground font-mono bg-white border border-border px-3 py-1.5 rounded-lg inline-block mb-5">
        {envio.trackingInterno}
      </p>

      <div className="flex justify-center mb-4">
        <ShipmentStateBadge estado={envio.estado} />
      </div>

      {description && (
        <p className="text-muted-foreground mb-10 leading-relaxed">{description}</p>
      )}

      <button
        onClick={onContinuar}
        className="w-full bg-primary text-white h-14 rounded-xl font-bold text-lg hover:bg-[#C4006A] transition-colors shadow-lg shadow-primary/25 flex items-center justify-center gap-3 mb-8"
      >
        <ScanLine className="w-5 h-5" /> Registrar siguiente paquete
      </button>

      {/* El historial sale de la respuesta del propio POST. No se enlaza a
          `GET /logistics/shipments/:id` porque su ownership admite al cliente,
          al vendedor y al repartidor asignado, pero no al empleado de
          sucursal: le respondería 404. */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm text-left">
        <h3 className="text-base font-bold text-foreground mb-5">Historial del envío</h3>
        <TrackingTimeline eventos={envio.historial} />
      </div>
    </div>
  );
}
