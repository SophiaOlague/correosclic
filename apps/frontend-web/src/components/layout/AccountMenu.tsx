import { LogOut, Package, Truck, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

/**
 * Reemplaza el botón estático "Mi cuenta" del export por el control real de
 * sesión: invita a entrar si no hay sesión y ofrece cerrarla si la hay.
 * Mantiene el mismo tamaño, radio y estados hover del diseño.
 */
export function AccountMenu() {
  const { isAuthenticated, user, signOut, hasRole } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={() => navigate(ROUTES.login)}
        className="hidden md:flex items-center gap-2 px-3 h-10 rounded-xl hover:bg-[#F5F6F8] transition-colors text-sm text-foreground"
      >
        <User className="w-4 h-4 text-muted-foreground" />
        <span className="hidden lg:block">Iniciar sesión</span>
      </button>
    );
  }

  const initials = `${user.nombre.charAt(0)}${user.apellidoPaterno.charAt(0)}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hidden md:flex items-center gap-2 px-3 h-10 rounded-xl hover:bg-[#F5F6F8] transition-colors text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
          {initials}
        </span>
        <span className="hidden lg:block max-w-28 truncate font-medium">{user.nombre}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-bold text-foreground truncate">
            {user.nombre} {user.apellidoPaterno}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* "Mi cuenta" es la pantalla de cuenta, no el panel del rol: desde
            ella se llega a los accesos que correspondan al usuario. */}
        <DropdownMenuItem onSelect={() => navigate(ROUTES.account)}>
          <User className="w-4 h-4 text-muted-foreground" />
          Mi cuenta
        </DropdownMenuItem>

        {/* `GET /orders` resuelve el `Cliente` del usuario y responde 404 si no
            lo tiene, que es el caso de los empleados y del administrador. */}
        {hasRole(ROLES.cliente) && (
          <DropdownMenuItem onSelect={() => navigate(ROUTES.orders)}>
            <Package className="w-4 h-4 text-muted-foreground" />
            Mis pedidos
          </DropdownMenuItem>
        )}

        {/* Acceso directo a los envíos que el vendedor debe llevar a sucursal. */}
        {hasRole(ROLES.vendedor) && (
          <DropdownMenuItem onSelect={() => navigate(ROUTES.vendorShipments)}>
            <Truck className="w-4 h-4 text-muted-foreground" />
            Envíos por entregar
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            // Primero se sale de la zona privada: si se cerrara la sesión
            // estando en una ruta protegida, el guard mandaría al login en vez
            // de a la portada.
            navigate(ROUTES.home, { replace: true });
            signOut();
            toast.success('Cerraste sesión.');
          }}
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
