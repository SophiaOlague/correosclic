import { MapPin, Star } from 'lucide-react';

import { TESTIMONIALS } from '../../lib/home-content';

export function Testimonials() {
  return (
    <section className="py-24 bg-[#F5F6F8]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Testimonios</p>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Lo que dicen nuestros compradores</h2>
          <p className="text-muted-foreground mt-3">Más de 125,000 opiniones verificadas de compradores reales en México.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className="bg-white rounded-2xl p-7 border border-border hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-5">
                {[...Array(5)].map((_, j) => (
                  <Star key={`t-star-${j}`} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              {/* Quote mark */}
              <div className="text-5xl font-black text-primary/10 leading-none mb-2 font-serif">"</div>
              <p className="text-sm text-foreground leading-relaxed mb-6 -mt-2">{t.text}"</p>
              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-border">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-border" />
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{t.city}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-[#006847]/10 text-[#006847] font-bold px-2 py-1 rounded-full">Verificado ✓</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 p-6 bg-white rounded-2xl border border-border">
          {[
            { n: "4.9/5", label: "Calificación promedio" },
            { n: "125K+", label: "Reseñas verificadas" },
            { n: "98%", label: "Clientes satisfechos" },
            { n: "72h", label: "Resolución de disputas" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-foreground">{s.n}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
