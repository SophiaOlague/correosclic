import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { ErrorState } from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';

import { useCategories, useCreateProduct } from '../hooks/useSellerProducts';
import { productSchema, type ProductFormValues } from '../schemas/seller.schemas';

/**
 * Alta de producto — `/vendedor/productos/nuevo`.
 *
 * Es solo el primer paso. Dar de alta un producto vendible son varias llamadas
 * que el backend **no envuelve en una transacción**: producto → variante →
 * inventario → imágenes. Presentarlo como un único "Guardar" mentiría sobre esa
 * atomicidad, así que al crear el producto se continúa en su ficha, donde se
 * agregan variantes, stock e imágenes y desde donde se publica.
 *
 * Los campos "precio de comparación" y "marca" del diseño no existen en
 * `Producto`; el precio vive en cada variante, no en el producto.
 */
export default function NewProductPage() {
  const navigate = useNavigate();

  const categories = useCategories();
  const createProduct = useCreateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { categoriaId: '', nombre: '', descripcion: '', pesoKg: 0 },
  });

  return (
    <main className="bg-[#F1F2F4] min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link
          to={ROUTES.sellerDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al panel
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-black text-foreground">Nuevo producto</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Empieza por los datos generales. Después agregarás variantes, stock e imágenes.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900 leading-relaxed">
            El producto se crea como borrador. Para publicarlo necesitará al menos una
            variante activa con inventario y stock disponible.
          </p>
        </div>

        <form
          className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm space-y-5"
          noValidate
          onSubmit={handleSubmit((values) =>
            createProduct.mutate(
              {
                categoriaId: values.categoriaId,
                nombre: values.nombre,
                ...(values.descripcion ? { descripcion: values.descripcion } : {}),
                pesoKg: values.pesoKg,
              },
              {
                onSuccess: (product) =>
                  navigate(`${ROUTES.sellerProducts}/${product.id}`, { replace: true }),
              },
            ),
          )}
        >
          <div>
            <label htmlFor="nombre" className="block text-xs font-bold text-foreground mb-2">
              Nombre del producto <span className="text-destructive">*</span>
            </label>
            <input
              id="nombre"
              {...register('nombre')}
              placeholder="Ej. Audífonos Bluetooth con cancelación de ruido"
              className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all"
            />
            {errors.nombre && (
              <p className="text-xs font-semibold text-destructive mt-1.5">
                {errors.nombre.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="descripcion"
              className="block text-xs font-bold text-foreground mb-2"
            >
              Descripción{' '}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <textarea
              id="descripcion"
              rows={5}
              {...register('descripcion')}
              className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
            />
            {errors.descripcion && (
              <p className="text-xs font-semibold text-destructive mt-1.5">
                {errors.descripcion.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="categoriaId"
                className="block text-xs font-bold text-foreground mb-2"
              >
                Categoría <span className="text-destructive">*</span>
              </label>

              {categories.isError ? (
                <ErrorState
                  title="No pudimos cargar las categorías"
                  onRetry={() => categories.refetch()}
                />
              ) : (
                <select
                  id="categoriaId"
                  {...register('categoriaId')}
                  defaultValue=""
                  disabled={categories.isLoading}
                  className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>
                    {categories.isLoading ? 'Cargando...' : 'Selecciona una categoría'}
                  </option>
                  {categories.data?.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              )}

              {errors.categoriaId && (
                <p className="text-xs font-semibold text-destructive mt-1.5">
                  {errors.categoriaId.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="pesoKg" className="block text-xs font-bold text-foreground mb-2">
                Peso (kg) <span className="text-destructive">*</span>
              </label>
              <input
                id="pesoKg"
                type="number"
                step="0.001"
                min="0.001"
                inputMode="decimal"
                {...register('pesoKg')}
                placeholder="0.500"
                className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Con este peso se cotiza el envío.
              </p>
              {errors.pesoKg && (
                <p className="text-xs font-semibold text-destructive mt-1.5">
                  {errors.pesoKg.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-5 border-t border-border">
            <Link
              to={ROUTES.sellerDashboard}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground inline-flex items-center justify-center px-4 h-11"
            >
              Descartar
            </Link>

            <button
              type="submit"
              disabled={createProduct.isPending}
              className="bg-[#006847] text-white px-8 h-11 rounded-xl text-sm font-bold hover:bg-[#005439] transition-colors shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {createProduct.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Crear y continuar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
