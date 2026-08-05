import { Heart, Star, TrendingUp, Zap } from 'lucide-react';

import { CategoryGrid } from '../components/CategoryGrid';
import { ProductCarousel } from '../components/ProductCarousel';
import { AppDownload } from '../components/home/AppDownload';
import { Benefits } from '../components/home/Benefits';
import { FAQ } from '../components/home/FAQ';
import { FeaturedStores } from '../components/home/FeaturedStores';
import { Hero } from '../components/home/Hero';
import { HowItWorks } from '../components/home/HowItWorks';
import { PromoBanner } from '../components/home/PromoBanner';
import { Testimonials } from '../components/home/Testimonials';

/**
 * Portada. Mantiene el orden exacto de secciones del export de Figma; la
 * diferencia es que los cuatro carruseles consultan el catálogo con filtros
 * distintos en vez de leer una constante en memoria.
 */
export default function HomePage() {
  return (
    <main>
      <Hero />

      <CategoryGrid />

      <ProductCarousel
        title="Recomendados para ti"
        query={{ orden: 'populares', limit: 4 }}
        bg="bg-[#F5F6F8]"
        icon={<Heart className="w-5 h-5" />}
      />

      <ProductCarousel
        title="Más vendidos"
        query={{ orden: 'relevancia', limit: 4 }}
        bg="bg-white"
        icon={<TrendingUp className="w-5 h-5" />}
      />

      <Benefits />

      <PromoBanner />

      <ProductCarousel
        title="Ofertas Relámpago"
        query={{ soloOfertas: true, limit: 4 }}
        bg="bg-[#F5F6F8]"
        icon={<Zap className="w-5 h-5" />}
      />

      <ProductCarousel
        title="Nuevos Lanzamientos"
        query={{ orden: 'recientes', limit: 4 }}
        bg="bg-white"
        icon={<Star className="w-5 h-5" />}
      />

      <HowItWorks />

      <FeaturedStores />

      <Testimonials />

      <FAQ />

      <AppDownload />
    </main>
  );
}
