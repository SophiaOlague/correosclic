import { Smartphone, Star } from 'lucide-react';

export function AppDownload() {
  return (
    <section className="py-6 bg-[#F5F6F8]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-[#1A1A2E] px-10 py-12 lg:px-16">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-[#006847]/10 rounded-full translate-y-1/2" />

          <div className="relative z-10 lg:flex items-center gap-16">
            <div className="flex-1 mb-8 lg:mb-0">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">App CorreosClic</p>
              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                Lleva el marketplace<br />en tu bolsillo.
              </h2>
              <p className="text-white/60 text-base mb-8 max-w-md">
                Compra, vende, rastrea tus pedidos y recibe alertas de precios en tiempo real. Disponible para iOS y Android.
              </p>
              <div className="flex flex-wrap gap-3">
                {["App Store", "Google Play"].map(store => (
                  <button key={store} className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white px-5 py-3 rounded-xl transition-colors">
                    <Smartphone className="w-5 h-5 text-white/70" />
                    <div className="text-left">
                      <p className="text-xs text-white/50 leading-none">Disponible en</p>
                      <p className="text-sm font-bold">{store}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {/* Phone mockup */}
            <div className="shrink-0 flex justify-center">
              <div className="relative w-56 h-72 bg-white/5 border-2 border-white/10 rounded-3xl flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1753161021236-76b0bdffb39f?w=300&h=400&fit=crop&auto=format"
                  alt="App CorreosClic"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white text-xs font-bold">CorreosClic App</p>
                  <div className="flex justify-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => <Star key={`app-star-${i}`} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
