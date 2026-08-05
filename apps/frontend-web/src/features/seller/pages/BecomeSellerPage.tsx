import {
  AlertCircle,
  BarChart3,
  Briefcase,
  CheckCircle,
  Clock,
  Globe,
  Loader2,
  Navigation,
  Package,
  Store,
  Truck,
} from 'lucide-react';
import { Link } from 'react-router';

import { ErrorState } from '@/components/common/EmptyState';
import { PageLoader } from '@/components/common/PageLoader';
import { ROUTES } from '@/constants/routes';
import type { SellerRequestDto } from '@/types/seller';

import { DocumentUploader } from '../components/DocumentUploader';
import { FiscalInformationForm } from '../components/FiscalInformationForm';
import { OnboardingStepper } from '../components/OnboardingStepper';
import {
  currentStep,
  isUnderReview,
  REQUIRED_DOCUMENTS,
} from '../lib/onboarding-steps';
import {
  useAddFiscalInformation,
  useCreateSellerRequest,
  useSellerRequest,
  useSubmitSellerRequest,
  useUploadSellerDocument,
} from '../hooks/useSellerOnboarding';

/**
 * Onboarding de vendedor — `/vender`.
 *
 * Toda la pantalla se deriva de `GET /seller/requests/me`: no hay estado local
 * que duplique el avance, así que el proceso es reanudable tras una recarga o
 * desde otro dispositivo. El "Simulador de Estados (Dev Only)" del export de
 * Figma desaparece: los estados ahora son reales.
 *
 * El diseño original era un formulario de una página con teléfono, correo de
 * soporte, dirección fiscal, categoría y logotipo. Ninguno existe en
 * `SolicitudVendedor`, y en cambio faltaban los tres documentos obligatorios
 * que el backend exige para enviar a revisión, así que se reorganizó como un
 * asistente de tres pasos fiel al contrato.
 */
export default function BecomeSellerPage() {
  const { data: request, isLoading, sinSolicitud, fallo, refetch } = useSellerRequest();

  if (isLoading) return <PageLoader label="Consultando tu solicitud..." />;

  if (fallo) {
    return (
      <main className="bg-[#F5F6F8] min-h-[60vh] py-16">
        <div className="max-w-2xl mx-auto px-4">
          <ErrorState onRetry={() => refetch()} />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#F5F6F8] min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        {sinSolicitud || !request ? <Invitation /> : <RequestFlow request={request} />}
      </div>
    </main>
  );
}

/** Portada: el usuario aún no ha iniciado ninguna solicitud. */
function Invitation() {
  const createRequest = useCreateSellerRequest();

  const beneficios = [
    { icon: Package, title: 'Productos ilimitados', desc: 'Publica todo tu catálogo sin costo extra.' },
    { icon: Globe, title: 'Cobertura nacional', desc: 'Llega a clientes de todo México.' },
    { icon: Navigation, title: 'Rastreo integrado', desc: 'Sigue cada envío desde tu panel.' },
    { icon: Briefcase, title: 'Gestión de inventario', desc: 'Control de stock por variante.' },
    { icon: Store, title: 'Tu propia tienda', desc: 'Con código público y descripción.' },
    { icon: Truck, title: 'Red de CorreosClic', desc: 'Nosotros nos encargamos de la logística.' },
    { icon: BarChart3, title: 'Estado de tus envíos', desc: 'Sabes siempre dónde está cada paquete.' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-black text-foreground mb-4 leading-tight">
          Vende en CorreosClic
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Expande tu negocio con la red logística de CorreosClic y llega a millones de
          mexicanos.
        </p>

        <button
          onClick={() => createRequest.mutate()}
          disabled={createRequest.isPending}
          className="w-full sm:w-auto bg-primary text-white px-8 h-14 rounded-xl font-bold hover:bg-[#C4006A] transition-colors shadow-lg shadow-primary/25 text-base inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {createRequest.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
          Comenzar solicitud
        </button>

        <p className="text-sm text-muted-foreground mt-4">
          Necesitarás tu RFC y tres documentos: identificación oficial, constancia de
          situación fiscal y comprobante de domicilio.
        </p>
      </div>

      <h2 className="text-xl font-black text-foreground mb-6">Lo que incluye</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {beneficios.map((beneficio) => (
          <div
            key={beneficio.title}
            className="p-5 rounded-2xl bg-[#F5F6F8] border border-transparent hover:border-border transition-colors"
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm mb-4">
              <beneficio.icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-foreground text-sm mb-1">{beneficio.title}</h3>
            <p className="text-xs text-muted-foreground">{beneficio.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Solicitud existente: se muestra según su estado real. */
function RequestFlow({ request }: { request: SellerRequestDto }) {
  if (request.estado === 'APROBADA') return <ApprovedPanel />;

  if (request.estado === 'RECHAZADA') return <RejectedPanel request={request} />;

  if (isUnderReview(request)) return <UnderReviewPanel />;

  return <StepsPanel request={request} />;
}

function StepsPanel({ request }: { request: SellerRequestDto }) {
  const paso = currentStep(request);

  const addFiscalInformation = useAddFiscalInformation(request.id);
  const uploadDocument = useUploadSellerDocument(request.id);
  const submitRequest = useSubmitSellerRequest(request.id);

  const faltantes = REQUIRED_DOCUMENTS.filter(
    (documento) =>
      !request.documentos.some((subido) => subido.tipoDocumento === documento.tipo),
  );

  return (
    <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-foreground">Solicitud de vendedor</h1>
          <p className="text-sm text-muted-foreground">
            Completa los tres pasos para enviarla a revisión.
          </p>
        </div>
      </div>

      <OnboardingStepper current={paso} />

      {paso === 'INFORMACION_FISCAL' && (
        <section>
          <h2 className="text-lg font-bold text-foreground mb-1">Información fiscal</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Debe coincidir con tu constancia de situación fiscal.
          </p>

          <FiscalInformationForm
            registrada={request.informacionFiscal}
            isPending={addFiscalInformation.isPending}
            onSubmit={(values) => addFiscalInformation.mutate(values)}
          />
        </section>
      )}

      {paso === 'DOCUMENTOS' && (
        <section>
          <h2 className="text-lg font-bold text-foreground mb-1">Documentos</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Los tres son obligatorios. Formatos admitidos: JPG, PNG, WEBP o PDF, hasta 5 MB.
          </p>

          <div className="space-y-4">
            {REQUIRED_DOCUMENTS.map((documento) => (
              <DocumentUploader
                key={documento.tipo}
                label={documento.label}
                hint={documento.hint}
                tipo={documento.tipo}
                cargado={request.documentos.find(
                  (subido) => subido.tipoDocumento === documento.tipo,
                )}
                isPending={
                  uploadDocument.isPending &&
                  uploadDocument.variables?.tipoDocumento === documento.tipo
                }
                onUpload={(tipo, file) => uploadDocument.mutate({ tipoDocumento: tipo, file })}
              />
            ))}
          </div>
        </section>
      )}

      {paso === 'REVISION' && (
        <section>
          <h2 className="text-lg font-bold text-foreground mb-1">Revisa y envía</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Confirma que todo esté correcto. Una vez enviada, la solicitud pasa a revisión.
          </p>

          <FiscalInformationForm
            registrada={request.informacionFiscal}
            isPending={false}
            onSubmit={() => undefined}
          />

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Documentos cargados</h3>
            {request.documentos.map((documento) => (
              <div
                key={documento.tipoDocumento}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F6F8]"
              >
                <CheckCircle className="w-4 h-4 text-[#006847] shrink-0" />
                <span className="text-sm font-semibold text-foreground truncate">
                  {REQUIRED_DOCUMENTS.find((item) => item.tipo === documento.tipoDocumento)
                    ?.label ?? documento.tipoDocumento}
                </span>
                <a
                  href={documento.urlArchivo}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-xs font-bold text-primary hover:underline shrink-0"
                >
                  Ver
                </a>
              </div>
            ))}
          </div>

          {faltantes.length > 0 && (
            <p className="text-xs font-semibold text-destructive mt-4">
              Aún faltan documentos por subir.
            </p>
          )}

          <div className="flex justify-end pt-6 mt-6 border-t border-border">
            <button
              onClick={() => submitRequest.mutate()}
              disabled={submitRequest.isPending || faltantes.length > 0}
              className="bg-primary text-white px-10 h-12 rounded-xl font-bold hover:bg-[#C4006A] transition-colors shadow-lg shadow-primary/25 inline-flex items-center gap-2 disabled:opacity-50"
            >
              {submitRequest.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Enviar solicitud
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function UnderReviewPanel() {
  return (
    <div className="bg-white rounded-2xl border border-border p-8 sm:p-12 shadow-sm text-center">
      <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Clock className="w-10 h-10" />
      </div>

      <h1 className="text-2xl font-black text-foreground mb-3">Solicitud en revisión</h1>
      <p className="text-muted-foreground max-w-md mx-auto">
        Ya recibimos tu información y la estamos revisando. Este proceso puede tardar algunos
        días hábiles.
      </p>

      {/* El diseño prometía un aviso por correo; no hay módulo de
          notificaciones, así que se indica cómo consultar el avance. */}
      <p className="text-sm text-muted-foreground bg-[#F5F6F8] p-4 rounded-xl inline-block mt-8">
        Puedes volver a esta página en cualquier momento para ver el resultado.
      </p>
    </div>
  );
}

function ApprovedPanel() {
  return (
    <div className="bg-white rounded-2xl border border-border p-8 sm:p-12 shadow-sm text-center">
      <div className="w-24 h-24 bg-[#006847]/10 text-[#006847] rounded-full flex items-center justify-center mx-auto mb-6 relative">
        <div className="absolute inset-0 border-4 border-[#006847] rounded-full animate-ping opacity-20" />
        <CheckCircle className="w-10 h-10" />
      </div>

      <h1 className="text-2xl font-black text-foreground mb-3">¡Bienvenido como vendedor!</h1>
      <p className="text-muted-foreground mb-10 max-w-md mx-auto">
        Tu solicitud fue aprobada. El siguiente paso es crear tu tienda para empezar a
        publicar productos.
      </p>

      <Link
        to={ROUTES.sellerDashboard}
        className="bg-[#006847] text-white px-8 h-12 rounded-xl font-bold hover:bg-[#005439] transition-colors shadow-lg shadow-[#006847]/25 inline-flex items-center justify-center gap-2"
      >
        <Store className="w-5 h-5" /> Ir al panel del vendedor
      </Link>
    </div>
  );
}

function RejectedPanel({ request }: { request: SellerRequestDto }) {
  const createRequest = useCreateSellerRequest();

  return (
    <div className="bg-white rounded-2xl border border-border p-8 sm:p-12 shadow-sm text-center">
      <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-10 h-10" />
      </div>

      <h1 className="text-2xl font-black text-foreground mb-3">Solicitud rechazada</h1>

      {/* El motivo lo redacta el revisor: se muestra literal, sin reescribirlo. */}
      {request.comentariosRevision ? (
        <>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            No pudimos aprobar tu solicitud por lo siguiente:
          </p>
          <p className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl text-sm font-medium mb-10 text-left whitespace-pre-line">
            {request.comentariosRevision}
          </p>
        </>
      ) : (
        <p className="text-muted-foreground mb-10 max-w-md mx-auto">
          No pudimos aprobar tu solicitud en este momento.
        </p>
      )}

      <button
        onClick={() => createRequest.mutate()}
        disabled={createRequest.isPending}
        className="bg-primary text-white px-8 h-12 rounded-xl font-bold hover:bg-[#C4006A] transition-colors shadow-lg shadow-primary/25 inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {createRequest.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Iniciar una nueva solicitud
      </button>

      <p className="text-xs text-muted-foreground mt-4">
        Tendrás que capturar de nuevo tu información fiscal y tus documentos.
      </p>
    </div>
  );
}
