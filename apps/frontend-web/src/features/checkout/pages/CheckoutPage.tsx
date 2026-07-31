import { AlertTriangle, ArrowLeft, Lock, MapPin, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';
import { ApiError } from '@/services/http';

import { AddressSelector } from '../components/AddressSelector';
import { CheckoutStepper } from '../components/CheckoutStepper';
import { CheckoutSummary } from '../components/CheckoutSummary';
import { VendorShipmentGroup } from '../components/VendorShipmentGroup';
import { useCheckoutAddresses, useCheckoutSummary, useVendorGroups } from '../hooks/useCheckout';

/**
 * Finalizar compra.
 *
 * Consume únicamente `GET /checkout` y `GET /checkout/addresses`: es una
 * pantalla de lectura. Al elegir otra dirección cambia la clave de la consulta
 * y el backend recotiza el envío; el frontend no recalcula ningún importe.
 *
 * El flujo termina aquí a propósito. Crear el pedido y cobrar pertenecen a los
 * módulos siguientes.
 */
export default function CheckoutPage() {
  const [direccionId, setDireccionId] = useState<string | undefined>(undefined);

  const addressesQuery = useCheckoutAddresses();
  const summaryQuery = useCheckoutSummary(direccionId);

  const summary = summaryQuery.data;
  const vendorGroups = useVendorGroups(summary);

  // Mientras no se elija nada, la seleccionada es la que el backend usó.
  const seleccionada = direccionId ?? summary?.direccionId;
  const isRecalculating = summaryQuery.isFetching && !summaryQuery.isLoading;

  if (summaryQuery.isLoading) return <CheckoutSkeleton />;

  if (summaryQuery.isError) {
    return <CheckoutError error={summaryQuery.error} onRetry={() => summaryQuery.refetch()} />;
  }

  if (!summary) return null;

  return (
    <main className="bg-[#F5F6F8] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              to={ROUTES.cart}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al carrito
            </Link>
            <h1 className="text-2xl font-black text-foreground">Finalizar compra</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#006847] bg-[#006847]/10 px-3 py-1.5 rounded-lg">
            <Lock className="w-4 h-4" /> Pago 100% seguro
          </div>
        </div>

        <CheckoutStepper current={2} />

        {/* Avisos del backend: stock insuficiente detectado al cotizar. */}
        {!summary.canCheckout && summary.warnings.length > 0 && (
          <div className="mt-12 mb-6 bg-destructive/5 border border-destructive/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground mb-2">
                  No puedes continuar con la compra todavía
                </p>
                <ul className="space-y-1.5">
                  {summary.warnings.map((warning) => (
                    <li key={warning} className="text-sm text-muted-foreground">
                      {warning}
                    </li>
                  ))}
                </ul>
                <Link
                  to={ROUTES.cart}
                  className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-primary hover:underline"
                >
                  Ajustar mi carrito
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className={`flex flex-col lg:flex-row gap-8 items-start ${summary.canCheckout ? 'mt-12' : ''}`}>
          <div className="flex-1 w-full space-y-6">
            <AddressSelector
              addresses={addressesQuery.data ?? []}
              selectedId={seleccionada}
              onSelect={setDireccionId}
              isLoading={addressesQuery.isLoading}
              isRecalculating={isRecalculating}
            />

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">
                {vendorGroups.length > 1
                  ? `Tu pedido llega en ${vendorGroups.length} envíos`
                  : 'Tu envío'}
              </h2>

              {vendorGroups.length > 1 && (
                <p className="text-sm text-muted-foreground mb-4">
                  Cada vendedor envía por separado. Solo se cobra completa la tarifa más alta; los
                  demás envíos se aplican con descuento.
                </p>
              )}

              <div className={`space-y-4 transition-opacity ${isRecalculating ? 'opacity-60' : ''}`}>
                {vendorGroups.map((group) => (
                  <VendorShipmentGroup key={group.vendedorId} group={group} />
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[380px] shrink-0">
            <CheckoutSummary summary={summary} isRecalculating={isRecalculating} />
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Los errores de `GET /checkout` son de negocio y cada uno pide una salida
 * distinta, así que se distinguen por el mensaje que redacta el backend.
 */
function CheckoutError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const apiError = error instanceof ApiError ? error : null;
  const mensaje = apiError?.message ?? '';

  const carritoVacio = mensaje.includes('carrito está vacío');
  const sinDireccion = mensaje.toLowerCase().includes('dirección');

  return (
    <main className="bg-[#F5F6F8] min-h-[60vh] py-16">
      <div className="max-w-2xl mx-auto px-4">
        {carritoVacio ? (
          <EmptyState
            icon={ShoppingCart}
            title="Tu carrito está vacío"
            description="Agrega productos para poder finalizar una compra."
            action={
              <Link
                to={ROUTES.catalog}
                className="bg-primary text-white px-6 h-11 inline-flex items-center rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
              >
                Ir al catálogo
              </Link>
            }
          />
        ) : sinDireccion ? (
          <EmptyState
            icon={MapPin}
            title="Necesitas una dirección de entrega"
            description={mensaje}
            action={
              <Link
                to={ROUTES.cart}
                className="bg-primary text-white px-6 h-11 inline-flex items-center rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
              >
                Volver al carrito
              </Link>
            }
          />
        ) : (
          // Cubre zona tarifaria inexistente, vendedor sin estado de operación
          // y cualquier otro fallo: el backend ya explica el motivo.
          <ErrorState
            title="No pudimos preparar tu compra"
            description={mensaje || 'Inténtalo de nuevo en unos momentos.'}
            onRetry={onRetry}
          />
        )}
      </div>
    </main>
  );
}

function CheckoutSkeleton() {
  return (
    <main className="bg-[#F5F6F8] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-8 w-56 bg-white rounded animate-pulse mb-8" />
        <div className="h-24 bg-white rounded-2xl border border-border animate-pulse mb-8" />
        <div className="flex flex-col lg:flex-row gap-8 items-start mt-12">
          <div className="flex-1 w-full space-y-6">
            <div className="h-56 bg-white rounded-2xl border border-border animate-pulse" />
            <div className="h-72 bg-white rounded-2xl border border-border animate-pulse" />
          </div>
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="h-96 bg-white rounded-2xl border border-border animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
