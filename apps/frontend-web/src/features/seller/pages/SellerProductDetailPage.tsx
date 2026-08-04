import {
  ArrowLeft,
  Check,
  ImageOff,
  Loader2,
  Package,
  PlusCircle,
  UploadCloud,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';
import { ApiError } from '@/services/http';
import type { SellerProductDetailDto, SellerProductVariantDto } from '@/types/seller';
import { formatMoney, formatNumber } from '@/utils/format';

import { VariantForm } from '../components/VariantForm';
import {
  useCreateVariant,
  useSellerProduct,
  useUpdateInventory,
  useUpdatePublication,
  useUploadProductImage,
} from '../hooks/useSellerProducts';

/**
 * Ficha del producto — `/vendedor/productos/:id`.
 *
 * Reúne lo que el backend expone en llamadas separadas —variantes, inventario,
 * imágenes y publicación— en una sola pantalla, porque para el vendedor son un
 * único objeto. Cada acción es su propia petición y falla por separado; nada se
 * da por hecho hasta que el backend responde.
 */
export default function SellerProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError, error, refetch } = useSellerProduct(id);

  const [agregandoVariante, setAgregandoVariante] = useState(false);

  const createVariant = useCreateVariant(id);
  const updatePublication = useUpdatePublication();
  const uploadImage = useUploadProductImage(id);

  if (isLoading) {
    return (
      <main className="bg-[#F1F2F4] min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <div className="h-9 w-72 bg-white rounded animate-pulse" />
          <div className="h-40 bg-white rounded-2xl border border-border animate-pulse" />
          <div className="h-64 bg-white rounded-2xl border border-border animate-pulse" />
        </div>
      </main>
    );
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.isNotFound;

    return (
      <main className="bg-[#F1F2F4] min-h-[60vh] py-16">
        <div className="max-w-2xl mx-auto px-4">
          {notFound ? (
            <EmptyState
              icon={Package}
              title="No encontramos este producto"
              description="Puede que el enlace sea incorrecto o que el producto no pertenezca a tu tienda."
              action={
                <Link
                  to={ROUTES.sellerDashboard}
                  className="bg-primary text-white px-6 h-11 inline-flex items-center rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
                >
                  Ver mis productos
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

  if (!product) return null;

  return (
    <main className="bg-[#F1F2F4] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          to={ROUTES.sellerDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a mis productos
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-foreground">{product.nombre}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-mono">{product.codigoPublico}</span> ·{' '}
              {product.categoria.nombre} · {product.pesoKg} kg
            </p>
          </div>

          <PublicationControl
            product={product}
            isPending={updatePublication.isPending}
            onToggle={(publicado) =>
              updatePublication.mutate({ productId: product.id, publicado })
            }
          />
        </header>

        {product.descripcion && (
          <section className="bg-white rounded-2xl border border-border p-6 shadow-sm mb-6">
            <h2 className="font-bold text-foreground mb-2">Descripción</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {product.descripcion}
            </p>
          </section>
        )}

        <ImagesSection
          product={product}
          isPending={uploadImage.isPending}
          onUpload={(file) => uploadImage.mutate(file)}
        />

        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Variantes</h2>
              <p className="text-sm text-muted-foreground">
                Cada variante tiene su propio SKU, precio y stock.
              </p>
            </div>

            {!agregandoVariante && (
              <button
                onClick={() => setAgregandoVariante(true)}
                className="bg-[#006847] text-white px-4 h-10 rounded-lg text-sm font-semibold hover:bg-[#005439] transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Agregar variante
              </button>
            )}
          </div>

          {agregandoVariante && (
            <div className="mb-4">
              <VariantForm
                isPending={createVariant.isPending}
                onCancel={() => setAgregandoVariante(false)}
                onSubmit={(values) =>
                  createVariant.mutate(
                    {
                      variante: {
                        sku: values.sku,
                        precio: values.precio,
                        ...(values.pesoKg ? { pesoKg: values.pesoKg } : {}),
                        valorAtributoIds: values.valorAtributoIds,
                      },
                      inventario: {
                        stockDisponible: values.stockDisponible,
                        stockMinimo: values.stockMinimo,
                      },
                    },
                    { onSuccess: () => setAgregandoVariante(false) },
                  )
                }
              />
            </div>
          )}

          {product.variantes.length === 0 && !agregandoVariante ? (
            <EmptyState
              icon={Package}
              title="Este producto aún no tiene variantes"
              description="Necesitas al menos una variante activa con stock para poder publicarlo."
            />
          ) : (
            <div className="space-y-3">
              {product.variantes.map((variante) => (
                <VariantRow key={variante.id} variante={variante} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/**
 * Publicar exige que el producto sea comprable. El backend valida las tres
 * condiciones y responde 409 con el motivo; aquí se anticipa el estado del
 * botón para no ofrecer una acción que se sabe que va a fallar.
 */
function PublicationControl({
  product,
  isPending,
  onToggle,
}: {
  product: SellerProductDetailDto;
  isPending: boolean;
  onToggle: (publicado: boolean) => void;
}) {
  const publicable = product.variantes.some(
    (variante) => variante.activa && (variante.stockDisponible ?? 0) > 0,
  );

  if (product.publicado) {
    return (
      <div className="text-right">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#006847]/10 text-[#006847] border border-[#006847]/20 mb-2">
          <Check className="w-3.5 h-3.5" /> Publicado
        </span>
        <button
          onClick={() => onToggle(false)}
          disabled={isPending}
          className="block bg-white border border-border text-foreground px-4 h-10 rounded-lg text-sm font-semibold hover:bg-[#F5F6F8] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Retirar del catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="text-right">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F5F6F8] text-muted-foreground border border-border mb-2">
        Borrador
      </span>

      <button
        onClick={() => onToggle(true)}
        disabled={isPending || !publicable}
        className="block bg-[#006847] text-white px-4 h-10 rounded-lg text-sm font-semibold hover:bg-[#005439] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Publicar
      </button>

      {!publicable && (
        <p className="text-xs text-muted-foreground mt-2 max-w-[220px]">
          Necesita una variante activa con stock disponible.
        </p>
      )}
    </div>
  );
}

function VariantRow({ variante }: { variante: SellerProductVariantDto }) {
  const [editando, setEditando] = useState(false);
  const [stockDisponible, setStockDisponible] = useState(
    String(variante.stockDisponible ?? 0),
  );
  const [stockMinimo, setStockMinimo] = useState(String(variante.stockMinimo ?? 0));

  const updateInventory = useUpdateInventory();

  const guardar = () =>
    updateInventory.mutate(
      {
        variantId: variante.id,
        body: {
          stockDisponible: Number(stockDisponible),
          stockMinimo: Number(stockMinimo),
        },
        existe: variante.stockDisponible !== null,
      },
      { onSuccess: () => setEditando(false) },
    );

  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-black text-foreground font-mono text-sm">{variante.sku}</p>

          {variante.atributos.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {variante.atributos
                .map((atributo) => `${atributo.atributo}: ${atributo.valor}`)
                .join(' · ')}
            </p>
          )}

          <p className="text-sm font-bold text-foreground mt-2">
            {formatMoney(variante.precio, { cents: true })}
          </p>
        </div>

        <div className="text-right">
          {variante.stockDisponible === null ? (
            <p className="text-xs font-semibold text-amber-600">Sin inventario</p>
          ) : (
            <>
              <p
                className={`text-sm font-bold ${
                  variante.stockDisponible === 0 ? 'text-destructive' : 'text-foreground'
                }`}
              >
                {formatNumber(variante.stockDisponible)} disponibles
              </p>
              {variante.stockReservado !== null && variante.stockReservado > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formatNumber(variante.stockReservado)} reservados
                </p>
              )}
            </>
          )}

          {!editando && (
            <button
              onClick={() => setEditando(true)}
              className="text-xs font-bold text-primary hover:underline mt-1"
            >
              Ajustar inventario
            </button>
          )}
        </div>
      </div>

      {editando && (
        <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor={`stock-${variante.id}`}
              className="block text-xs font-bold text-foreground mb-1.5"
            >
              Disponible
            </label>
            <input
              id={`stock-${variante.id}`}
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={stockDisponible}
              onChange={(event) => setStockDisponible(event.target.value)}
              className="w-28 bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-3 py-2 text-sm outline-none transition-all"
            />
          </div>

          <div>
            <label
              htmlFor={`minimo-${variante.id}`}
              className="block text-xs font-bold text-foreground mb-1.5"
            >
              Mínimo
            </label>
            <input
              id={`minimo-${variante.id}`}
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={stockMinimo}
              onChange={(event) => setStockMinimo(event.target.value)}
              className="w-28 bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-3 py-2 text-sm outline-none transition-all"
            />
          </div>

          <button
            onClick={guardar}
            disabled={updateInventory.isPending}
            className="bg-[#006847] text-white px-4 h-10 rounded-lg text-sm font-bold hover:bg-[#005439] transition-colors inline-flex items-center gap-2 disabled:opacity-50"
          >
            {updateInventory.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar
          </button>

          <button
            onClick={() => setEditando(false)}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground px-3 h-10 inline-flex items-center gap-1"
          >
            <X className="w-4 h-4" /> Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

/** Hasta 10 imágenes por producto; el límite lo impone el backend. */
function ImagesSection({
  product,
  isPending,
  onUpload,
}: {
  product: SellerProductDetailDto;
  isPending: boolean;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const alLimite = product.imagenes.length >= 10;

  return (
    <section className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-foreground">Imágenes</h2>
        <span className="text-xs text-muted-foreground">{product.imagenes.length} de 10</span>
      </div>

      <div className="flex flex-wrap gap-3">
        {product.imagenes.map((imagen) => (
          <div
            key={imagen.id}
            className="w-24 h-24 rounded-xl overflow-hidden border border-border bg-[#F5F6F8] relative"
          >
            <img src={imagen.url} alt="" className="w-full h-full object-cover" />
            {imagen.esPrincipal && (
              <span className="absolute bottom-0 inset-x-0 bg-[#006847] text-white text-[10px] font-bold text-center py-0.5">
                Principal
              </span>
            )}
          </div>
        ))}

        {product.imagenes.length === 0 && (
          <div className="w-24 h-24 rounded-xl border border-dashed border-border bg-[#F5F6F8] flex items-center justify-center">
            <ImageOff className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Subir imagen del producto"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file);
          event.target.value = '';
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending || alLimite}
        className="w-full mt-4 bg-[#F5F6F8] border border-dashed border-border hover:border-primary hover:text-primary rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <UploadCloud className="w-4 h-4" />
        )}
        {alLimite ? 'Alcanzaste el límite de 10 imágenes' : 'Subir imagen (JPG, PNG o WEBP)'}
      </button>
    </section>
  );
}
