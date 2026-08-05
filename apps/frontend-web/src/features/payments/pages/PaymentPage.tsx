import { Elements } from '@stripe/react-stripe-js';
import { AlertTriangle, ArrowLeft, Clock, Loader2, Lock, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { PageLoader } from '@/components/common/PageLoader';
import { ROUTES } from '@/constants/routes';
import { useOrder } from '@/features/orders/hooks/useOrders';
import { ApiError } from '@/services/http';
import { formatMoney } from '@/utils/format';

import { PaymentForm } from '../components/PaymentForm';
import { PaymentSuccess } from '../components/PaymentSuccess';
import { useCreatePaymentIntent, usePaymentStatus } from '../hooks/usePayments';
import { stripeAppearance } from '../lib/appearance';
import { hasStripeKey, stripePromise } from '../lib/stripe';

/**
 * Pago de un pedido — `/pago/:orderId`.
 *
 * Orquesta las tres piezas sin mezclarlas: Orders dice qué se paga, Payments
 * crea o reutiliza el PaymentIntent y informa el estado, y Stripe Elements solo
 * captura y confirma. El resultado que ve el usuario **siempre** viene de
 * `GET /payments/order/:orderId`, nunca del SDK.
 */
export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const [searchParams] = useSearchParams();

  const orderQuery = useOrder(orderId);
  const createIntent = useCreatePaymentIntent();

  /** El `clientSecret` vive solo aquí, en memoria, mientras dura la pantalla. */
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  /**
   * Los métodos que exigen redirección (3D Secure) devuelven al usuario a esta
   * misma ruta con los parámetros de Stripe y **sin nada del estado de React**.
   * En ese caso hay que sondear desde el montaje: de lo contrario la pantalla
   * volvería a mostrar el formulario de una operación que ya está en curso.
   */
  const vueltoDeStripe =
    searchParams.has('redirect_status') || searchParams.has('payment_intent');

  const [sondeando, setSondeando] = useState(vueltoDeStripe);

  const payment = usePaymentStatus(orderId, sondeando);

  const order = orderQuery.data;
  const yaPagado = order?.estado === 'PAGADO';

  // Si el pedido llega ya pagado (por ejemplo al volver a esta URL), no se pide
  // ningún intent: se muestra la confirmación directamente.
  useEffect(() => {
    if (!orderId || !order || yaPagado || clientSecret || createIntent.isPending) return;
    if (sondeando) return;

    createIntent.mutate(orderId, {
      onSuccess: (intent) => setClientSecret(intent.clientSecret),
    });
  }, [orderId, order, yaPagado, clientSecret, createIntent, sondeando]);

  if (!hasStripeKey()) {
    return (
      <main className="bg-[#F5F6F8] min-h-[60vh] py-16">
        <div className="max-w-2xl mx-auto px-4">
          <ErrorState
            title="El pago no está configurado"
            description="Falta la clave publicable de Stripe (VITE_STRIPE_PUBLISHABLE_KEY) en este entorno."
          />
        </div>
      </main>
    );
  }

  if (orderQuery.isLoading) return <PageLoader label="Cargando tu pedido..." />;

  if (orderQuery.isError) {
    const notFound = orderQuery.error instanceof ApiError && orderQuery.error.isNotFound;

    return (
      <main className="bg-[#F5F6F8] min-h-[60vh] py-16">
        <div className="max-w-2xl mx-auto px-4">
          <EmptyState
            title={notFound ? 'No encontramos este pedido' : 'No pudimos cargar el pedido'}
            description={
              notFound
                ? 'Puede que el enlace sea incorrecto o que el pedido no esté asociado a tu cuenta.'
                : undefined
            }
            action={
              <Link
                to={ROUTES.orders}
                className="bg-primary text-white px-6 h-11 inline-flex items-center rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
              >
                Ver mis pedidos
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  if (!order) return null;

  /* Pago confirmado por el backend: pantalla de confirmación. */
  if (yaPagado || payment.data?.status === 'EXITOSO') {
    return (
      <main>
        <PaymentSuccess order={order} />
      </main>
    );
  }

  const estado = payment.data?.status;
  const rechazado = estado === 'FALLIDO' || estado === 'CANCELADO';
  const esperandoConfirmacion = sondeando && !payment.esTerminal && !payment.tiempoAgotado;

  return (
    <main className="bg-[#F5F6F8] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          to={`${ROUTES.orders}/${order.orderId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al pedido
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-foreground">Pagar pedido</h1>
            <p className="text-sm text-muted-foreground mt-1">{order.orderNumber}</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#006847] bg-[#006847]/10 px-3 py-1.5 rounded-lg">
            <Lock className="w-4 h-4" /> Pago 100% seguro
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full">
            {esperandoConfirmacion ? (
              <ConfirmingPanel />
            ) : payment.tiempoAgotado ? (
              <PendingConfirmationPanel orderId={order.orderId} />
            ) : rechazado ? (
              <RejectedPanel
                mensaje={payment.data?.mensajeError}
                onRetry={() => {
                  payment.reiniciarSondeo();
                  setSondeando(false);
                  setClientSecret(null);
                }}
              />
            ) : createIntent.isError ? (
              <ErrorState
                title="No pudimos preparar el pago"
                description={
                  createIntent.error instanceof ApiError
                    ? createIntent.error.message
                    : undefined
                }
                onRetry={() => orderId && createIntent.mutate(orderId, {
                  onSuccess: (intent) => setClientSecret(intent.clientSecret),
                })}
              />
            ) : clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance: stripeAppearance, locale: 'es' }}
              >
                <PaymentForm
                  amount={order.resumenFinanciero.total}
                  currency="MXN"
                  returnUrl={`${window.location.origin}${ROUTES.payment}/${order.orderId}`}
                  onConfirmed={() => setSondeando(true)}
                />
              </Elements>
            ) : (
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <div className="h-6 w-40 bg-[#F5F6F8] rounded animate-pulse mb-6" />
                <div className="space-y-3">
                  <div className="h-12 bg-[#F5F6F8] rounded-xl animate-pulse" />
                  <div className="h-12 bg-[#F5F6F8] rounded-xl animate-pulse" />
                  <div className="h-12 bg-[#F5F6F8] rounded-xl animate-pulse" />
                </div>
                <div className="h-14 bg-[#F5F6F8] rounded-xl animate-pulse mt-6" />
              </div>
            )}
          </div>

          <div className="w-full lg:w-[340px] shrink-0">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-[136px]">
              <h2 className="text-lg font-black text-foreground mb-5">Resumen</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-border text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatMoney(order.resumenFinanciero.subtotal, { cents: true })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="font-medium text-foreground">
                    {formatMoney(order.resumenFinanciero.costoEnvio, { cents: true })}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-2xl font-black text-foreground leading-none">
                  {formatMoney(order.resumenFinanciero.total, { cents: true })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-[#006847]/5 p-3 rounded-xl border border-[#006847]/10">
                <ShieldCheck className="w-5 h-5 text-[#006847] shrink-0" />
                <p>
                  Procesado de forma segura por Stripe.{' '}
                  <span className="font-semibold text-foreground">Compra protegida.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/** Stripe aceptó la confirmación; esperamos a que el webhook llegue al backend. */
function ConfirmingPanel() {
  return (
    <div className="bg-white rounded-2xl border border-border p-8 shadow-sm text-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-5" />
      <p className="text-lg font-black text-foreground mb-2">Confirmando tu pago</p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Estamos verificando la operación con el banco. No cierres esta ventana.
      </p>
    </div>
  );
}

/**
 * Se agotaron los 20 s sin estado definitivo. No se afirma éxito ni fallo:
 * el webhook puede llegar en cualquier momento.
 */
function PendingConfirmationPanel({ orderId }: { orderId: string }) {
  return (
    <div className="bg-white rounded-2xl border border-amber-200 p-8 shadow-sm text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
        <Clock className="w-7 h-7 text-amber-600" />
      </div>

      <p className="text-lg font-black text-foreground mb-2">Estamos confirmando tu pago</p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
        Tu operación sigue en proceso. En cuanto se confirme, el estado de tu pedido se
        actualizará automáticamente.
      </p>

      <Link
        to={`${ROUTES.orders}/${orderId}`}
        className="bg-primary text-white px-6 h-11 inline-flex items-center rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
      >
        Ir al detalle del pedido
      </Link>
    </div>
  );
}

/** El backend registró el pago como FALLIDO o CANCELADO. */
function RejectedPanel({
  mensaje,
  onRetry,
}: {
  mensaje: string | null | undefined;
  onRetry: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-destructive/20 p-8 shadow-sm text-center">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
        <XCircle className="w-7 h-7 text-destructive" />
      </div>

      <p className="text-lg font-black text-foreground mb-2">No se pudo completar tu pago</p>

      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
        {mensaje ?? 'El banco rechazó la operación. Puedes intentarlo con otra tarjeta.'}
      </p>

      <button
        onClick={onRetry}
        className="bg-primary text-white px-6 h-11 inline-flex items-center gap-2 rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
      >
        <AlertTriangle className="w-4 h-4" />
        Intentar de nuevo
      </button>
    </div>
  );
}
