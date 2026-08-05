import { ChevronRight, ImageOff, Package } from 'lucide-react';
import { Link } from 'react-router';

import { ROUTES } from '@/constants/routes';
import type { SellerProductListItemDto } from '@/types/seller';
import { formatMoney, formatNumber } from '@/utils/format';

/**
 * Tabla de "Mis productos".
 *
 * Conserva la composición del export de Figma. Dos diferencias que impone el
 * contrato: la columna "Estado" muestra la publicación real —el único estado
 * que el vendedor puede cambiar— y no hay acción de eliminar, porque el
 * backend no expone ningún borrado de productos.
 */
export function ProductTable({ products }: { products: SellerProductListItemDto[] }) {
  return (
    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[720px]">
          <thead className="bg-[#F5F6F8]/50 text-xs text-muted-foreground uppercase border-b border-border">
            <tr>
              <th className="px-5 py-4 font-semibold">Producto</th>
              <th className="px-5 py-4 font-semibold">Estado</th>
              <th className="px-5 py-4 font-semibold">Inventario</th>
              <th className="px-5 py-4 font-semibold">Precio</th>
              <th className="px-5 py-4 font-semibold">Categoría</th>
              <th className="px-5 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-[#F5F6F8]/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F5F6F8] overflow-hidden shrink-0 border border-border flex items-center justify-center">
                      {product.imagenPrincipalUrl ? (
                        <img
                          src={product.imagenPrincipalUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-foreground truncate max-w-[220px]">
                        {product.nombre}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {product.codigoPublico}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${
                      product.publicado
                        ? 'bg-[#006847]/10 text-[#006847]'
                        : 'bg-[#F5F6F8] text-muted-foreground'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        product.publicado ? 'bg-[#006847]' : 'bg-muted-foreground'
                      }`}
                    />
                    {product.publicado ? 'Publicado' : 'Borrador'}
                  </span>
                </td>

                <td className="px-5 py-4">
                  {product.totalVariantes === 0 ? (
                    <span className="text-xs font-semibold text-amber-600">Sin variantes</span>
                  ) : (
                    <span
                      className={`font-medium ${
                        product.stockTotal === 0 ? 'text-destructive' : 'text-foreground'
                      }`}
                    >
                      {formatNumber(product.stockTotal)} en stock
                      <span className="text-xs text-muted-foreground ml-1">
                        ({product.totalVariantes}{' '}
                        {product.totalVariantes === 1 ? 'variante' : 'variantes'})
                      </span>
                    </span>
                  )}
                </td>

                <td className="px-5 py-4 font-bold text-foreground whitespace-nowrap">
                  {product.precioDesde !== null ? (
                    formatMoney(product.precioDesde, { cents: true })
                  ) : (
                    <span className="text-muted-foreground font-normal">—</span>
                  )}
                </td>

                <td className="px-5 py-4 text-muted-foreground">
                  {product.categoria.nombre}
                </td>

                <td className="px-5 py-4 text-right">
                  <Link
                    to={`${ROUTES.sellerProducts}/${product.id}`}
                    className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                  >
                    Gestionar <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="px-5 py-16 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F6F8] flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-bold text-foreground">
            No encontramos productos con ese criterio
          </p>
        </div>
      )}
    </div>
  );
}
