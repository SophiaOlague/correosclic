import {
  Award,
  Heart,
  Home,
  Package,
  Star,
  Tag,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * Icono y paleta de cada categoría.
 *
 * Es información puramente visual del diseño de Figma: `Categoria` en Prisma
 * solo guarda nombre, slug y descripción. Se resuelve por `slug` y hay un
 * aspecto por defecto para categorías que el backend añada más adelante.
 */
interface CategoryVisual {
  icon: LucideIcon;
  light: string;
  text: string;
}

const VISUALS: Record<string, CategoryVisual> = {
  electronica: { icon: Zap, light: 'bg-blue-50', text: 'text-blue-600' },
  moda: { icon: Tag, light: 'bg-pink-50', text: 'text-[#E4007C]' },
  hogar: { icon: Home, light: 'bg-amber-50', text: 'text-amber-600' },
  deportes: { icon: Award, light: 'bg-green-50', text: 'text-[#006847]' },
  belleza: { icon: Star, light: 'bg-purple-50', text: 'text-purple-600' },
  juguetes: { icon: Package, light: 'bg-orange-50', text: 'text-orange-600' },
  automotriz: { icon: TrendingUp, light: 'bg-slate-50', text: 'text-slate-600' },
  mascotas: { icon: Heart, light: 'bg-teal-50', text: 'text-teal-600' },
};

const FALLBACK: CategoryVisual = {
  icon: Package,
  light: 'bg-[#F5F6F8]',
  text: 'text-muted-foreground',
};

export function categoryVisual(slug: string): CategoryVisual {
  return VISUALS[slug] ?? FALLBACK;
}
