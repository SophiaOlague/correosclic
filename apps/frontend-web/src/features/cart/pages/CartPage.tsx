import { ArrowRight, ChevronRight, Info, ShieldCheck, ShoppingCart, Ticket, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { ErrorState } from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';
import { formatMoney } from '@/utils/format';

import { CartItemRow, CartItemRowSkeleton } from '../components/CartItemRow';
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '../hooks/useCart';

/**
 * Carrito de compras, conectado a `/cart` del backend.
 *
 * Todo lo que se ve sale de la respuesta de la API: los totales no se calculan
 * aquí. Mientras una mutación está en vuelo se bloquean los controles de la
 * fila afectada, para que no se acumulen peticiones contradictorias.
 */
export default function CartPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading, isError, refetch } = useCart();

  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  const [coupon, setCoupon] = useState('');

  /** Fila concreta que está esperando respuesta del backend. */
  const busyItemId =
    updateItem.isPending ? updateItem.variables?.itemId
    : removeItem.isPending ? removeItem.variables
    : null;

  const isMutating = updateItem.isPending || removeItem.isPending || clearCart.isPending;

  if (isLoading) return <CartSkeleton />;

  if (isError) {
    return (
      <main className="bg-[#F5F6F8] min-h-[60vh] py-16">
        <div className="max-w-2xl mx-auto px-4">
          <ErrorState
            title="No pudimos cargar tu carrito"
            description="Revisa tu conexión e inténtalo de nuevo."
            onRetry={() => refetch()}
          />
        </div>
      </main>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) return <EmptyCart />;

  const totalArticulos = items.reduce((total, item) => total + item.cantidad, 0);
  const hayNoDisponibles = items.some((item) => !item.disponible);

  return (
    <main className="bg-[#F5F6F8] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <nav aria-label="Ruta" className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to={ROUTES.home} className="hover:text-foreground">
            Inicio
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-semibold">Carrito de compras</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl lg:text-3xl font-black text-foreground">
            Carrito de compras
            <span className="text-lg font-medium text-muted-foreground ml-2">
              ({totalArticulos} {totalArticulos === 1 ? 'artículo' : 'artículos'})
            </span>
          </h1>

          <button
            onClick={() => clearCart.mutate()}
            disabled={isMutating}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Vaciar carrito
          </button>
        </div>

        {hayNoDisponibles && (
          <div className="mb-6 bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-sm text-foreground">
            Algunos productos ya no tienen stock suficiente. Ajusta las cantidades o quítalos
            antes de continuar con tu compra.
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Productos */}
          <div className="flex-1 space-y-4 w-full">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-white rounded-xl border border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-6">Producto</div>
              <div className="col-span-3 text-center">Cantidad</div>
              <div className="col-span-3 text-right">Precio</div>
            </div>

            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                isBusy={busyItemId === item.id || clearCart.isPending}
                onQuantityChange={(cantidad) =>
                  updateItem.mutate({ itemId: item.id, cantidad })
                }
                onRemove={() => removeItem.mutate(item.id)}
              />
            ))}
          </div>

          {/* Resumen */}
          <div className="w-full lg:w-[380px] shrink-0 space-y-4">
            {/* TODO: Backend integration pending — no existe módulo de cupones. */}
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Ticket className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Código de descuento</h3>
              </div>
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  toast.info('Los cupones de descuento estarán disponibles próximamente.');
                }}
              >
                <input
                  type="text"
                  value={coupon}
                  onChange={(event) => setCoupon(event.target.value)}
                  aria-label="Código de descuento"
                  placeholder="Ingresa tu cupón"
                  className="flex-1 h-10 bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 text-sm outline-none transition-all uppercase"
                />
                <button
                  type="submit"
                  className={`px-4 rounded-xl text-sm font-bold transition-colors ${coupon ? 'bg-primary text-white' : 'bg-[#F5F6F8] text-muted-foreground'}`}
                >
                  Aplicar
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-[136px]">
              <h2 className="text-lg font-black text-foreground mb-5">Resumen de compra</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-border text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Productos ({totalArticulos})
                  </span>
                  <span className="font-medium text-foreground">
                    {formatMoney(cart?.subtotal ?? 0, { cents: true })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Envío <Info className="w-3.5 h-3.5" />
                  </span>
                  {/* El envío lo cotiza GET /checkout por vendedor y dirección. */}
                  <span className="text-xs font-semibold text-muted-foreground text-right max-w-[10rem]">
                    Se calcula en el siguiente paso
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="text-base font-bold text-foreground">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-foreground block leading-none">
                    {formatMoney(cart?.total ?? 0, { cents: true })}
                  </span>
                  <span className="text-xs text-muted-foreground">IVA incluido, sin envío</span>
                </div>
              </div>

              <button
                onClick={() => navigate(ROUTES.checkout)}
                disabled={isMutating || hayNoDisponibles}
                title={hayNoDisponibles ? 'Ajusta los productos sin stock para continuar' : undefined}
                className="w-full bg-primary text-white h-14 rounded-xl font-bold hover:bg-[#C4006A] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/25 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar compra <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-[#F5F6F8] py-2 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-[#006847]" /> Pago 100% seguro y encriptado
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function EmptyCart() {
  return (
    <main className="bg-[#F5F6F8] min-h-[60vh] py-16 flex flex-col items-center justify-center">
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
        <ShoppingCart className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-black text-foreground mb-2">Tu carrito está vacío</h1>
      <p className="text-muted-foreground mb-8">¡Hay miles de productos esperando por ti!</p>
      <Link
        to={ROUTES.catalog}
        className="bg-primary text-white px-8 h-12 rounded-xl font-bold hover:bg-[#C4006A] transition-colors flex items-center gap-2 shadow-lg shadow-primary/25"
      >
        Descubrir productos <ArrowRight className="w-4 h-4" />
      </Link>
    </main>
  );
}

function CartSkeleton() {
  return (
    <main className="bg-[#F5F6F8] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-4 w-48 bg-white rounded animate-pulse mb-6" />
        <div className="h-8 w-72 bg-white rounded animate-pulse mb-8" />

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4 w-full">
            {[...Array(2)].map((_, index) => (
              <CartItemRowSkeleton key={index} />
            ))}
          </div>
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white rounded-2xl border border-border h-72 animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
