import { CreditCard, Globe, Shield, Truck } from 'lucide-react';

import { useViewNavigate } from '@/hooks/useViewNavigate';

/**
 * Pie de página del sitio. Markup extraído sin cambios del export de Figma;
 * la navegación pasa por `useViewNavigate` en lugar del prop `setView`.
 *
 * TODO: Backend integration pending — los enlaces de las columnas son
 * estáticos; solo "Rastrear pedido" navega, igual que en el diseño original.
 */
export function Footer() {
  const setView = useViewNavigate();
  const cols = [
    { title: "Comprar",     links: ["Electrónica", "Moda y ropa", "Hogar y jardín", "Deportes", "Belleza", "Ver todas"] },
    { title: "Vender",      links: ["Cómo vender", "Planes y tarifas", "Centro de recursos", "Soporte vendedor", "Casos de éxito"] },
    { title: "CorreosClic", links: ["Sobre nosotros", "Prensa", "Blog", "Trabaja con nosotros", "Sustentabilidad"] },
    { title: "Ayuda",       links: ["Centro de ayuda", "Rastrear pedido", "Devoluciones", "Métodos de pago", "Contáctanos"] },
  ];

  return (
    <footer className="bg-[#0F0F1A] text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-white font-black text-sm">CC</span>
              </div>
              <span className="font-black text-white text-lg">Correos<span className="text-primary">Clic</span></span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-6">Tu marketplace de confianza, respaldado por la red de Correos de México.</p>
            {/* Social */}
            <div className="flex gap-2">
              {["f", "in", "tw", "ig", "yt"].map(s => (
                <button key={s} className="w-9 h-9 rounded-xl bg-white/8 hover:bg-primary flex items-center justify-center text-white/50 hover:text-white text-xs font-bold transition-all duration-150">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {cols.map(col => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-white mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link}>
                    <button onClick={() => { if (link === "Rastrear pedido") setView("tracking"); }} className="text-sm text-white/50 hover:text-white transition-colors">{link}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="border-t border-white/8 pt-10 pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { icon: <Shield className="w-5 h-5" />,   label: "Compra protegida",     sub: "Garantía de devolución 30 días" },
              { icon: <Truck className="w-5 h-5" />,    label: "Envío garantizado",    sub: "Red Correos de México" },
              { icon: <CreditCard className="w-5 h-5" />,label: "Pago seguro",         sub: "Cifrado SSL 256-bit" },
              { icon: <Globe className="w-5 h-5" />,    label: "32 estados",           sub: "Cobertura nacional total" },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-3 bg-white/4 rounded-xl px-4 py-3">
                <div className="text-primary/70">{b.icon}</div>
                <div>
                  <p className="text-xs font-bold text-white/80">{b.label}</p>
                  <p className="text-xs text-white/40">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© 2025 CorreosClic S.A. de C.V. · Todos los derechos reservados.</p>
          <div className="flex flex-wrap items-center gap-5 text-xs text-white/30">
            {["Aviso de privacidad", "Términos y condiciones", "Política de cookies", "Mapa del sitio"].map(t => (
              <a key={t} href="#" className="hover:text-white/60 transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

