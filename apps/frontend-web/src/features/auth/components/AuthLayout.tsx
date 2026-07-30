import { ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { ROUTES } from '@/constants/routes';

/**
 * Layout de dos columnas de las pantallas de autenticación.
 * Markup extraído sin cambios del export de Figma; la única diferencia es que
 * el logo navega con el router en vez de con un prop `setView`.
 */
export function AuthLayout({
  children,
  isLogin,
}: {
  children: ReactNode;
  isLogin: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 mb-12 cursor-pointer w-fit"
            onClick={() => navigate(ROUTES.home)}
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/30">
              <span className="text-white font-black text-sm tracking-tight">CC</span>
            </div>
            <span className="font-black text-foreground text-xl tracking-tight">
              Correos<span className="text-primary">Clic</span>
            </span>
          </div>

          {children}

        </div>
      </div>

      {/* Right Side: Illustration */}
      <div className="hidden lg:flex w-1/2 bg-[#F5F6F8] p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#006847]/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg text-center">
          <div className="aspect-square mb-12 relative">
            <img
              src={isLogin ? "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop&auto=format" : "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=800&fit=crop&auto=format"}
              alt="CorreosClic"
              className="w-full h-full object-cover rounded-3xl shadow-2xl mix-blend-multiply"
            />
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/10" />
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-border flex items-center gap-3">
              <div className="w-12 h-12 bg-[#006847]/10 text-[#006847] rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-foreground">Compra protegida</p>
                <p className="text-xs text-muted-foreground">Respaldo Correos de México</p>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4">Todo México en un solo clic</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {isLogin
              ? "Accede a millones de productos de vendedores locales con envío seguro a todo el país."
              : "Únete a la plataforma logística y comercial más grande del país."}
          </p>
        </div>
      </div>
    </div>
  );
}
