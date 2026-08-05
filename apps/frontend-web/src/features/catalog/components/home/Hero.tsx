import { CheckCircle, Search, Star, Truck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { ROUTES } from '@/constants/routes';

export function Hero() {
  const trending = ["iPhone 15 Pro", "Tenis Nike", "Audífonos", "Laptop HP", "Perfumes", "Smartwatch"];
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // El buscador del diseño no hacía nada; ahora lleva al catálogo con el
  // término aplicado, igual que el de la navbar.
  const search = (term: string) => {
    const trimmed = term.trim();
    navigate(trimmed ? `${ROUTES.catalog}?q=${encodeURIComponent(trimmed)}` : ROUTES.catalog);
  };
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-white pt-8">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-primary/4 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#006847]/4 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-12">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 text-primary text-xs font-semibold px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              🇲🇽 El marketplace oficial de Correos de México
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.05]">
                Todo México,<br />
                <span className="text-primary">en un solo clic.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                La confianza de Correos de México con la conveniencia del comercio digital. Más de 2 millones de productos, entrega garantizada en los 32 estados.
              </p>
            </div>

            {/* Search */}
            <form
              className="relative max-w-lg"
              onSubmit={(event) => {
                event.preventDefault();
                search(query);
              }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Buscar productos"
                placeholder="¿Qué estás buscando hoy?"
                className="w-full h-14 pl-12 pr-36 bg-[#F5F6F8] border-2 border-transparent rounded-2xl text-base placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-primary focus:bg-white transition-all duration-200 shadow-sm"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white h-10 px-5 rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/25">
                Buscar
              </button>
            </form>

            {/* Trending */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">Tendencias:</span>
              {trending.map(t => (
                <button key={t} onClick={() => search(t)} className="text-xs bg-[#F5F6F8] hover:bg-accent hover:text-primary text-muted-foreground px-3 py-1.5 rounded-full transition-colors font-medium border border-transparent hover:border-primary/15">
                  {t}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-2">
              {[
                { num: "2M+", label: "Productos" },
                { num: "50K+", label: "Vendedores" },
                { num: "32", label: "Estados" },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-foreground tracking-tight">{s.num}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
              <div className="w-px h-10 bg-border" />
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["1534528741775-53994a69daeb", "1507003211169-0a1dd7228f2d", "1438761681033-6461ffad8d80"].map((id, i) => (
                    <img key={`hero-user-${i}`} src={`https://images.unsplash.com/photo-${id}?w=40&h=40&fit=crop&auto=format`} alt="user" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={`hero-star-${i}`} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-xs text-muted-foreground">+125K opiniones</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — image */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/15 aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1713256683892-5bab22f76be0?w=900&h=1100&fit=crop&auto=format"
                alt="Compras en CorreosClic"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Floating card — free shipping */}
            <div className="absolute -left-8 top-12 bg-white rounded-2xl shadow-xl shadow-black/10 px-4 py-3 flex items-center gap-3 border border-border">
              <div className="w-10 h-10 bg-[#006847]/10 rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5 text-[#006847]" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Envío gratis</p>
                <p className="text-xs text-muted-foreground">En miles de productos</p>
              </div>
            </div>

            {/* Floating card — order */}
            <div className="absolute -right-6 bottom-16 bg-white rounded-2xl shadow-xl shadow-black/10 p-4 border border-border w-52">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-[#006847]" />
                <span className="text-xs font-bold text-[#006847]">¡Pedido confirmado!</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Audífonos Sony WH-1000XM5</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">$7,299 MXN</span>
                <span className="text-xs bg-[#006847]/10 text-[#006847] px-2 py-0.5 rounded-full font-semibold">En camino</span>
              </div>
            </div>

            {/* Floating badge — top right */}
            <div className="absolute -right-4 top-8 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-primary/30 rotate-3">
              Hasta -50% OFF 🔥
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
