import { ArrowRight, Zap } from 'lucide-react';

export function PromoBanner() {
  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 lg:p-14">
          {/* Decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2" />

          <div className="relative z-10 lg:flex items-center justify-between gap-8">
            <div className="mb-8 lg:mb-0">
              <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                <Zap className="w-3.5 h-3.5" /> Temporada de ofertas
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-3 tracking-tight">
                Hasta <span className="text-white underline decoration-wavy decoration-white/40 underline-offset-4">50% de descuento</span><br />en miles de productos.
              </h2>
              <p className="text-white/75 text-base max-w-lg">Aprovecha los precios más bajos del año. Ofertas actualizadas cada día con los mejores vendedores de México.</p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button className="bg-white text-primary px-8 h-12 rounded-xl font-bold hover:bg-white/90 transition-colors text-sm flex items-center gap-2 justify-center shadow-lg shadow-black/10">
                Ver todas las ofertas <ArrowRight className="w-4 h-4" />
              </button>
              <button className="border-2 border-white/30 text-white px-8 h-12 rounded-xl font-bold hover:bg-white/10 transition-colors text-sm flex items-center gap-2 justify-center">
                Suscribirme a alertas
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
