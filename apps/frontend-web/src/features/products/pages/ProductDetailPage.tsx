import { Award, ChevronRight, Heart, Loader2, Share2, Shield, Star, Tag, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { PageLoader } from '@/components/common/PageLoader';
import { ROUTES } from '@/constants/routes';
import { ProductCarousel } from '@/features/catalog/components/ProductCarousel';
import { useAddCartItem } from '@/features/cart/hooks/useCart';
import { useProduct } from '@/features/catalog/hooks/useCatalogQueries';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/services/http';
import { formatMoney, formatNumber } from '@/utils/format';

import { ProductGallery } from '../components/ProductGallery';
import { ProductTabs } from '../components/ProductTabs';
import { QuantityStepper } from '../components/QuantityStepper';
import { VariantSelector } from '../components/VariantSelector';

/**
 * Detalle de producto. Markup del export de Figma, con los datos del producto
 * real: galería, variantes con stock, precio de la variante elegida y pestañas.
 */
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError, error, refetch } = useProduct(id);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const addItem = useAddCartItem();

  const [variantId, setVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Preselecciona la primera variante con stock al cargar o cambiar de producto.
  useEffect(() => {
    if (!product) return;

    const firstAvailable =
      product.variantes.find((variant) => variant.activa && variant.stockDisponible > 0) ??
      product.variantes[0];

    setVariantId(firstAvailable?.id ?? null);
    setQuantity(1);
  }, [product]);

  if (isLoading) return <PageLoader label="Cargando producto..." />;

  if (isError) {
    const notFound = error instanceof ApiError && error.isNotFound;

    return (
      <main className="max-w-3xl mx-auto px-4 py-20">
        {notFound ? (
          <EmptyState
            title="No encontramos este producto"
            description="Puede que ya no esté disponible o que el enlace sea incorrecto."
            action={
              <Link
                to={ROUTES.catalog}
                className="bg-primary text-white px-5 h-11 inline-flex items-center rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
              >
                Ver el catálogo
              </Link>
            }
          />
        ) : (
          <ErrorState onRetry={() => refetch()} />
        )}
      </main>
    );
  }

  if (!product) return null;

  const selectedVariant = product.variantes.find((variant) => variant.id === variantId) ?? null;
  const precio = selectedVariant?.precio ?? product.precioDesde;
  const stock = selectedVariant?.stockDisponible ?? 0;
  const sinStock = stock <= 0;

  /**
   * `POST /cart/items`. El endpoint exige JWT, así que sin sesión se manda al
   * login guardando la ruta actual para volver aquí después.
   */
  const addToCart = (then?: () => void) => {
    if (!selectedVariant) {
      toast.error('Elige una variante para continuar.');
      return;
    }

    if (!isAuthenticated) {
      toast.info('Inicia sesión para agregar productos a tu carrito.');
      navigate(ROUTES.login, { state: { from: location.pathname } });
      return;
    }

    addItem.mutate(
      { productoVarianteId: selectedVariant.id, cantidad: quantity },
      { onSuccess: then },
    );
  };

  return (
    <main>
      <div className="bg-white min-h-screen pt-4 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumbs */}
          <nav aria-label="Ruta" className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link to={ROUTES.home} className="hover:text-foreground">
              Inicio
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link
              to={`${ROUTES.catalog}?categoria=${product.categoria.id}`}
              className="hover:text-foreground"
            >
              {product.categoria.nombre}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-semibold line-clamp-1">{product.nombre}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 mb-16">
            <ProductGallery images={product.imagenes} alt={product.nombre} />

            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <p className="text-sm font-semibold text-primary">{product.tienda.nombre}</p>
                <div className="flex gap-2">
                  <button
                    aria-label="Compartir"
                    onClick={() => {
                      void navigator.clipboard?.writeText(window.location.href);
                      toast.success('Enlace copiado');
                    }}
                    className="w-10 h-10 rounded-full bg-[#F5F6F8] flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    aria-label="Agregar a favoritos"
                    className="w-10 h-10 rounded-full bg-[#F5F6F8] flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                    /* TODO: Backend integration pending — no hay módulo de favoritos. */
                    onClick={() => toast.success('Agregado a favoritos')}
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl lg:text-3xl font-black text-foreground mb-4 leading-tight">
                {product.nombre}
              </h1>

              {/* Calificación y ventas no existen en el esquema. Si el producto
                  no los trae, la fila entera no se renderiza: dejarla vacía
                  produciría una franja con borde y espacio muerto. */}
              {(product.calificacion !== undefined || product.unidadesVendidas !== undefined) && (
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border flex-wrap">
                  {product.calificacion !== undefined && (
                    <>
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, index) => (
                            <Star
                              key={`pdet-star-${index}`}
                              className={`w-4 h-4 ${index < Math.floor(product.calificacion!) ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-foreground ml-1">{product.calificacion}</span>
                      </div>
                      <a href="#reviews" className="text-sm text-primary hover:underline font-medium">
                        {formatNumber(product.totalOpiniones ?? 0)} opiniones
                      </a>
                    </>
                  )}
                  {product.unidadesVendidas !== undefined && (
                    <>
                      {product.calificacion !== undefined && (
                        <span className="w-1 h-1 rounded-full bg-border" />
                      )}
                      <span className="text-sm font-medium text-[#006847]">
                        {formatNumber(product.unidadesVendidas)}+ vendidos
                      </span>
                    </>
                  )}
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-4xl font-black text-foreground">{formatMoney(precio)}</span>
                  {product.precioAnterior && (
                    <span className="text-lg text-muted-foreground line-through mb-1.5">
                      {formatMoney(product.precioAnterior)}
                    </span>
                  )}
                </div>
                {product.etiqueta && (
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md mb-2">
                    <Tag className="w-3 h-3" />
                    Oferta {product.etiqueta}
                  </div>
                )}
              </div>

              {/* Envío */}
              <div className="bg-[#006847]/5 border border-[#006847]/10 rounded-xl p-4 mb-6 flex gap-4">
                <Truck className="w-6 h-6 text-[#006847] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#006847] mb-0.5">Envío a todo México</p>
                  {/* TODO: el costo y la fecha reales los calcula GET /checkout
                      por vendedor y dirección; aquí todavía no se conocen. */}
                  <p className="text-sm text-muted-foreground">
                    El costo exacto se calcula al finalizar tu compra, según tu dirección.
                  </p>
                </div>
              </div>

              <VariantSelector
                variants={product.variantes}
                selectedId={variantId}
                onSelect={(id) => {
                  setVariantId(id);
                  setQuantity(1);
                }}
              />

              <p className="text-sm font-medium text-foreground mb-4">
                Stock disponible:{' '}
                <span className={`font-normal ml-1 ${sinStock ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {sinStock ? 'sin unidades' : `${formatNumber(stock)} unidades`}
                </span>
              </p>

              <div className="flex gap-4 mb-8 flex-wrap">
                <QuantityStepper value={quantity} max={Math.max(1, stock)} onChange={setQuantity} />

                <div className="flex-1 flex flex-col sm:flex-row gap-3 min-w-[240px]">
                  {/* "Comprar ahora" agrega y lleva directo al carrito. */}
                  <button
                    disabled={sinStock || addItem.isPending}
                    onClick={() => addToCart(() => navigate(ROUTES.cart))}
                    className="flex-1 bg-primary text-white h-14 rounded-xl font-bold hover:bg-[#C4006A] transition-colors shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addItem.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                    Comprar ahora
                  </button>
                  <button
                    disabled={sinStock || addItem.isPending}
                    onClick={() => addToCart()}
                    className="flex-1 bg-primary/10 text-primary h-14 rounded-xl font-bold hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addItem.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                    Agregar al carrito
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Compra Protegida.</span> Recibe
                    el producto que esperabas o te devolvemos tu dinero.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Garantía.</span> 12 meses de
                    garantía de fábrica aplicable directamente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ProductTabs product={product} />
        </div>
      </div>

      <ProductCarousel
        title="Productos Relacionados"
        query={{ categoriaId: product.categoriaId, limit: 4 }}
        bg="bg-[#F5F6F8]"
        icon={<Tag className="w-5 h-5" />}
      />
    </main>
  );
}
