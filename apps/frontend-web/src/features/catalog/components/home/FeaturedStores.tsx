import { ArrowRight, Star } from 'lucide-react';

import { STORES } from '../../lib/home-content';

export function FeaturedStores() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Tiendas</p>
            <h2 className="text-3xl font-black text-foreground tracking-tight">Tiendas destacadas</h2>
          </div>
          <button className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary hover:text-[#C4006A] transition-colors">
            Ver todas <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STORES.map((store, i) => (
            <div key={store.name} className="group border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white">
              {/* Store banner */}
              <div className={`h-28 bg-gradient-to-br ${store.color} flex items-center justify-center`}>
                <span className="text-5xl font-black text-white/20">{store.initial}</span>
              </div>
              {/* Store info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 -mt-8 rounded-xl bg-gradient-to-br ${store.color} flex items-center justify-center shadow-lg border-2 border-white`}>
                    <span className="text-white font-black text-lg">{store.initial}</span>
                  </div>
                  <span className="text-xs bg-[#006847]/10 text-[#006847] font-bold px-2 py-1 rounded-lg mt-1">Verificada</span>
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">{store.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{store.category}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-foreground">{store.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{store.sales} ventas</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
