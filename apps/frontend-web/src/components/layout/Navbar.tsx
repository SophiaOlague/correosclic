import { useState } from 'react';
import { Bell, ChevronRight, Search, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { ROUTES } from '@/constants/routes';
import { useCartItemCount } from '@/features/cart/hooks/useCart';
import { useCategories } from '@/features/catalog/hooks/useCatalogQueries';

import { AccountMenu } from './AccountMenu';

/**
 * Barra superior del sitio. El markup se extrajo sin cambios del export de
 * Figma; la navegación va por rutas reales (`<Link>` / `useNavigate`). Se
 * eliminaron el prop `sellerStatus` y los estados `mobileOpen`/`mode`, que el
 * export declaraba pero nunca usaba.
 *
 * El selector de rol del diseño —un atajo de demostración que saltaba a
 * cualquier panel sin comprobar nada— se retiró al cerrar la integración: los
 * accesos reales del usuario están en "Mi cuenta" y en este mismo menú, y ya
 * dependen de sus roles.
 *
 * TODO: Backend integration pending — buscador y notificaciones.
 */
export function Navbar({ scrolled }: { scrolled: boolean }) {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const cartItemCount = useCartItemCount();
  const [query, setQuery] = useState("");

  const search = (term: string) => {
    const trimmed = term.trim();
    navigate(trimmed ? `${ROUTES.catalog}?q=${encodeURIComponent(trimmed)}` : ROUTES.catalog);
  };

  // El export traía las categorías escritas a mano; ahora salen del catálogo,
  // con "Ofertas" al final como acceso directo al filtro de promociones.
  const navCats = (categories ?? []).slice(0, 6);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "shadow-lg shadow-black/5" : ""}`}>
      {/* Announcement */}
      <div className="bg-primary text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="hidden sm:block">📦 Envío gratis en compras +$500 MXN</span>
            <span className="hidden md:block">🇲🇽 Entrega garantizada en los 32 estados</span>
            <span className="hidden lg:block">🔒 Compra protegida por Correos de México</span>
          </div>
          <div className="flex items-center gap-4 text-white/80">
            <span className="cursor-pointer hover:text-white transition-colors">Ayuda</span>
            <span className="w-px h-3 bg-white/30" />
            <span className="cursor-pointer hover:text-white transition-colors font-medium">Vender aquí</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center gap-4">
          {/* Logo */}
          <Link to={ROUTES.home} className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/30">
              <span className="text-white font-black text-sm tracking-tight">CC</span>
            </div>
            <span className="font-black text-foreground text-lg tracking-tight hidden sm:block hover:text-primary transition-colors">
              Correos<span className="text-primary">Clic</span>
            </span>
          </Link>

          {/* Search */}
          <form
            className="flex-1 relative max-w-2xl"
            onSubmit={(e) => { e.preventDefault(); search(query); }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              type="search"
              aria-label="Buscar productos"
              placeholder="¿Qué estás buscando hoy?"
              className="w-full h-11 pl-11 pr-28 bg-[#F5F6F8] border border-transparent rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-white h-8 px-4 rounded-lg text-xs font-semibold hover:bg-[#C4006A] transition-colors"
            >
              Buscar
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <AccountMenu />
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F5F6F8] transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            <button
              className="flex items-center gap-2 bg-primary text-white px-4 h-10 rounded-xl hover:bg-[#C4006A] transition-colors text-sm font-semibold relative shadow-sm shadow-primary/20"
              onClick={() => navigate(ROUTES.cart)}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:block">Carrito</span>
              {/* El contador sale de GET /cart; sin sesión no hay carrito que contar. */}
              {cartItemCount > 0 && (
                <span className="w-5 h-5 bg-white text-primary rounded-full text-xs flex items-center justify-center font-bold">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category nav */}
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {navCats.map(cat => (
                <button key={cat.id} onClick={() => navigate(`${ROUTES.catalog}?categoria=${cat.id}`)} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-all whitespace-nowrap rounded-lg">
                  {cat.nombre}
                </button>
              ))}
              <button onClick={() => navigate(`${ROUTES.catalog}?ofertas=1`)} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-all whitespace-nowrap rounded-lg">
                Ofertas 🔥
              </button>
              <Link to={ROUTES.catalog} className="flex items-center gap-1 ml-auto px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground whitespace-nowrap">
                Ver todo <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
