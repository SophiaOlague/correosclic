import { ChevronDown, Headphones } from 'lucide-react';
import { useState } from 'react';

import { FAQS } from '../../lib/home-content';

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Preguntas frecuentes</h2>
          <p className="text-muted-foreground mt-3">Resolvemos tus dudas más comunes sobre comprar en CorreosClic.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={`faq-${i}`}
              className={`border rounded-2xl overflow-hidden transition-all duration-200 ${open === i ? "border-primary/20 shadow-md shadow-primary/5" : "border-border"}`}
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[#F5F6F8] transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className={`text-sm font-semibold transition-colors ${open === i ? "text-primary" : "text-foreground"}`}>
                  {faq.q}
                </span>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${open === i ? "bg-primary text-white rotate-180" : "bg-[#F5F6F8] text-muted-foreground"}`}>
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground mb-4">¿No encontraste lo que buscabas?</p>
          <button className="inline-flex items-center gap-2 bg-[#F5F6F8] hover:bg-accent border border-border hover:border-primary/20 text-foreground px-6 h-11 rounded-xl text-sm font-semibold transition-all hover:text-primary">
            <Headphones className="w-4 h-4" />Contactar soporte 24/7
          </button>
        </div>
      </div>
    </section>
  );
}
