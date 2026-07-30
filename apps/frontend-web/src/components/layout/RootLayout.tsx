import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';

import { useDocumentTitle } from '@/hooks/useDocumentTitle';

import { Footer } from './Footer';
import { Navbar } from './Navbar';

/**
 * Shell de la aplicación: navbar fija + contenido + footer.
 *
 * Reproduce exactamente el contenedor `#cc-root` del export de Figma —incluido
 * el scroll propio con scrollbar oculta y el espaciador de 136px bajo la
 * navbar— para que el diseño se conserve pixel a pixel.
 */
export function RootLayout() {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useDocumentTitle();

  useEffect(() => {
    const el = document.getElementById('cc-root');

    if (!el) return;

    const onScroll = () => setScrolled(el.scrollTop > 10);

    el.addEventListener('scroll', onScroll, { passive: true });

    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Volver arriba en cada cambio de ruta, igual que el export hacía al cambiar de vista.
  useEffect(() => {
    const el = document.getElementById('cc-root');
    if (el) el.scrollTop = 0;
  }, [pathname]);

  return (
    <div
      id="cc-root"
      className="min-h-screen overflow-y-auto bg-white"
      style={{ fontFamily: "'Inter', sans-serif", scrollbarWidth: 'none' }}
    >
      <style>{`#cc-root::-webkit-scrollbar{display:none;} .scrollbar-hide::-webkit-scrollbar{display:none;} .scrollbar-hide{scrollbar-width:none;}`}</style>

      <Navbar scrolled={scrolled} />

      {/* Espaciador de la navbar fija (anuncio + nav principal + categorías ≈ 136px) */}
      <div className="h-[136px]" />

      <Outlet />

      <Footer />
    </div>
  );
}
