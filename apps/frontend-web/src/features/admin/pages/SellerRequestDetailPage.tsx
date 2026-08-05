import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  User,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';
import { ApiError } from '@/services/http';

import { ApproveRequestForm } from '../components/ApproveRequestForm';
import { RejectRequestForm } from '../components/RejectRequestForm';
import { RequestStateBadge } from '../components/RequestStateBadge';
import {
  useApproveSellerRequest,
  useOperatingStates,
  useRejectSellerRequest,
  useSellerRequest,
} from '../hooks/useAdminSellerRequests';
import { documentLabel } from '../lib/admin-format';

type Resolucion = 'ninguna' | 'aprobar' | 'rechazar';

/**
 * Expediente completo de una solicitud y su resolución.
 *
 * `GET /admin/seller-requests/:id` expone datos fiscales y documentos de
 * identidad del solicitante; por eso todo `admin/` está restringido a
 * `SUPER_ADMIN`.
 */
export default function SellerRequestDetailPage() {
  const { id = '' } = useParams();
  const [resolucion, setResolucion] = useState<Resolucion>('ninguna');

  const solicitud = useSellerRequest(id);
  const pendiente = solicitud.data?.estado === 'PENDIENTE';

  // Se cargan junto al detalle y no al abrir el formulario: sin estados no hay
  // aprobación posible, y conviene saberlo antes de pulsar el botón.
  const estados = useOperatingStates(pendiente);

  const cerrar = () => setResolucion('ninguna');

  const aprobar = useApproveSellerRequest(id, cerrar);
  const rechazar = useRejectSellerRequest(id, cerrar);

  const noEncontrada = solicitud.error instanceof ApiError && solicitud.error.isNotFound;

  return (
    <div className="max-w-5xl">
      <Link
        to={ROUTES.adminSellerRequests}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a la cola
      </Link>

      {solicitud.isLoading && (
        <div className="space-y-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-32 bg-white rounded-2xl border border-border animate-pulse" />
          ))}
        </div>
      )}

      {noEncontrada && (
        <EmptyState
          icon={FileText}
          title="No encontramos esta solicitud"
          description="Puede que el enlace esté mal o que la solicitud ya no exista."
          action={
            <Link
              to={ROUTES.adminSellerRequests}
              className="bg-primary text-white px-6 h-11 inline-flex items-center rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
            >
              Volver a la cola
            </Link>
          }
        />
      )}

      {solicitud.isError && !noEncontrada && (
        <ErrorState onRetry={() => solicitud.refetch()} />
      )}

      {solicitud.data && (
        <div className="space-y-6">
          <header className="bg-white rounded-2xl border border-border shadow-sm p-6 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-black text-foreground mb-1 truncate">
                {solicitud.data.cliente.nombreCompleto}
              </h2>
              <p className="text-xs font-semibold text-muted-foreground">
                Paso actual: {solicitud.data.pasoActual}
              </p>
            </div>

            <RequestStateBadge estado={solicitud.data.estado} />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <h3 className="font-bold text-foreground mb-5 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Solicitante
              </h3>

              <dl className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground mb-0.5">Correo</dt>
                    <dd className="font-semibold text-foreground truncate">
                      {solicitud.data.cliente.email}
                    </dd>
                  </div>
                </div>

                {/* `telefono` es opcional en el DTO: si no viene, la fila no se
                    dibuja en vez de dejar un hueco. */}
                {solicitud.data.cliente.telefono && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <dt className="text-xs text-muted-foreground mb-0.5">Teléfono</dt>
                      <dd className="font-semibold text-foreground">
                        {solicitud.data.cliente.telefono}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </section>

            <section className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <h3 className="font-bold text-foreground mb-5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Información fiscal
              </h3>

              {solicitud.data.informacionFiscal ? (
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground mb-0.5">RFC</dt>
                    <dd className="font-bold text-foreground font-mono">
                      {solicitud.data.informacionFiscal.rfc}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground mb-0.5">Razón social</dt>
                    <dd className="font-semibold text-foreground">
                      {solicitud.data.informacionFiscal.razonSocial}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground mb-0.5">Régimen fiscal</dt>
                    <dd className="font-semibold text-foreground">
                      {solicitud.data.informacionFiscal.regimenFiscal}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Esta solicitud no tiene información fiscal registrada.
                </p>
              )}
            </section>
          </div>

          <section className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <h3 className="font-bold text-foreground mb-5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Documentos
              <span className="text-xs font-bold text-muted-foreground">
                {solicitud.data.documentos.length} de 3
              </span>
            </h3>

            {solicitud.data.documentos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No se cargó ningún documento.
              </p>
            ) : (
              <ul className="space-y-3">
                {solicitud.data.documentos.map((documento) => (
                  <li
                    key={documento.tipoDocumento}
                    className="flex flex-wrap items-center justify-between gap-3 bg-[#F5F6F8] rounded-xl px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">
                        {documentLabel(documento.tipoDocumento)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {documento.nombreArchivo}
                      </p>
                    </div>

                    <a
                      href={documento.urlArchivo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-white border border-border text-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-white/60 transition-colors shrink-0"
                    >
                      Abrir
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <h3 className="font-bold text-foreground mb-5">Resolución</h3>

            {!pendiente && (
              <div className="flex items-start gap-3 bg-[#F5F6F8] rounded-xl p-4">
                {solicitud.data.estado === 'APROBADA' ? (
                  <CheckCircle2 className="w-5 h-5 text-[#006847] shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Esta solicitud ya fue revisada, así que no admite otra resolución. El
                  backend responde 409 a cualquier intento.
                </p>
              </div>
            )}

            {pendiente && resolucion === 'ninguna' && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setResolucion('aprobar')}
                  className="bg-[#006847] text-white px-6 h-12 rounded-xl font-bold hover:bg-[#005439] transition-colors shadow-sm inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Aprobar
                </button>

                <button
                  onClick={() => setResolucion('rechazar')}
                  className="bg-white border border-destructive/30 text-destructive px-6 h-12 rounded-xl font-bold hover:bg-destructive/5 transition-colors inline-flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Rechazar
                </button>
              </div>
            )}

            {pendiente && resolucion === 'aprobar' && (
              <ApproveRequestForm
                estados={estados.data}
                isLoading={estados.isLoading}
                isError={estados.isError}
                isPending={aprobar.isPending}
                onSubmit={(estadoOperacionId) => aprobar.mutate(estadoOperacionId)}
                onCancel={cerrar}
              />
            )}

            {pendiente && resolucion === 'rechazar' && (
              <RejectRequestForm
                isPending={rechazar.isPending}
                onSubmit={(comentarios) => rechazar.mutate(comentarios)}
                onCancel={cerrar}
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}
