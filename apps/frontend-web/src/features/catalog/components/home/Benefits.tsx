import { CreditCard, Headphones, Shield, Truck } from 'lucide-react';

export function Benefits() {
  const items = [
    { icon: <Truck className="w-6 h-6" />,      title: "Envío a todo México",    desc: "Red de distribución de Correos de México. Entregamos en los 32 estados del país.",     color: "text-blue-600 bg-blue-50" },
    { icon: <Shield className="w-6 h-6" />,     title: "Compra protegida",       desc: "Tu dinero está seguro hasta que confirmes que tu pedido llegó en perfectas condiciones.", color: "text-[#006847] bg-[#006847]/10" },
    { icon: <CreditCard className="w-6 h-6" />, title: "Pago 100% seguro",       desc: "Tarjetas, OXXO Pay, transferencia SPEI, Mercado Pago y hasta 18 MSI con bancos.",       color: "text-primary bg-primary/10" },
    { icon: <Headphones className="w-6 h-6" />, title: "Soporte 24/7",           desc: "Nuestro equipo está disponible todos los días para resolver cualquier situación.",        color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">¿Por qué elegirnos?</p>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Beneficios de comprar en CorreosClic</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Construimos el marketplace de México sobre la red más confiable del país.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item.title} className="group p-6 rounded-2xl border border-border hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-200 bg-white">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${item.color} group-hover:scale-110 transition-transform duration-200`}>
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
