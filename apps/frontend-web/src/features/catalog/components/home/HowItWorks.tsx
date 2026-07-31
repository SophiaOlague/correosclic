import { ArrowRight, CreditCard, Package, Search, User } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    { n: "01", icon: <User className="w-7 h-7" />,       title: "Crea tu cuenta gratis",          desc: "Regístrate en segundos con tu correo o número de teléfono. Sin cargos ni complicaciones." },
    { n: "02", icon: <Search className="w-7 h-7" />,      title: "Encuentra lo que buscas",         desc: "Explora millones de productos de miles de vendedores verificados en todo México." },
    { n: "03", icon: <CreditCard className="w-7 h-7" />,  title: "Paga de forma segura",            desc: "Múltiples métodos de pago, todos protegidos. Tu información siempre cifrada y segura." },
    { n: "04", icon: <Package className="w-7 h-7" />,     title: "Recibe en tu puerta",             desc: "Seguimiento en tiempo real con Correos de México. Entrega garantizada en tu domicilio." },
  ];

  return (
    <section className="py-24 bg-[#F5F6F8]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Simple y rápido</p>
          <h2 className="text-3xl font-black text-foreground tracking-tight">¿Cómo funciona?</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Comprar en CorreosClic es tan fácil como 1, 2, 3, 4.</p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-[52px] left-[12.5%] right-[12.5%] h-0.5 bg-border hidden lg:block" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.n} className="relative group text-center">
                {/* Step circle */}
                <div className="relative z-10 w-26 mx-auto mb-6">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white border-2 border-border group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/15 transition-all duration-300 flex items-center justify-center text-muted-foreground group-hover:text-primary">
                    {step.icon}
                  </div>
                </div>
                <span className="text-5xl font-black text-border group-hover:text-primary/15 transition-colors duration-300 block mb-3 -mt-2">{step.n}</span>
                <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px] mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-14">
          <button className="bg-primary text-white px-10 h-12 rounded-xl font-bold hover:bg-[#C4006A] transition-colors text-sm flex items-center gap-2 shadow-lg shadow-primary/25">
            Comenzar ahora — es gratis <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
