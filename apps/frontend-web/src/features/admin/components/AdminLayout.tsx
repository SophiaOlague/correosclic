import { ArrowLeft, LogOut, Menu, X } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useMatches, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/PageLoader';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { SessionExpiryWatcher } from '@/providers/SessionExpiryWatcher';

import { useSellerRequests } from '../hooks/useAdminSellerRequests';
import { ADMIN_NAV } from '../lib/admin-nav';

/**
 * Shell del panel administrativo.
 *
 * Se monta como raíz propia del router, fuera de `RootLayout`: el diseño de
 * Figma es un dashboard a pantalla completa con su propia barra superior, y
 * apilarlo bajo la navbar del sitio dejaría dos cabeceras y el pie de página
 * del marketplace colgando de un panel de administración.
 *
 * Por estar fuera de `RootLayout` asume sus tres responsabilidades: el título
 * del documento, el `<Suspense>` de las rutas diferidas y el vigilante de
 * caducidad de sesión.
 */
export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  useDocumentTitle();

  // El menú móvil es un overlay: dejarlo abierto tras navegar taparía la
  // pantalla que se acaba de pedir.
  useEffect(() => setMenuAbierto(false), [pathname]);

  const titulo = useSectionTitle();

  // Dato real, no el badge fijo del export: es la misma consulta que alimenta
  // la cola, así que comparte caché con la pantalla de solicitudes.
  const solicitudes = useSellerRequests();
  const pendientes = solicitudes.data?.length ?? 0;

  const iniciales = user
    ? `${user.nombre.charAt(0)}${user.apellidoPaterno.charAt(0)}`.toUpperCase()
    : 'CC';

  return (
    <div className="flex h-screen bg-[#F5F6F8] overflow-hidden font-sans">
      <SessionExpiryWatcher />

      {/* Velo del menú móvil */}
      {menuAbierto && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMenuAbierto(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 w-[260px] bg-[#0F0F1A] text-slate-300 flex flex-col h-full shrink-0 transition-transform duration-300 ${
          menuAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <Link to={ROUTES.home} className="flex items-center min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-sm shadow-primary/20 shrink-0">
              <span className="text-white font-black text-xs">CC</span>
            </div>
            <span className="font-bold text-white tracking-tight truncate">
              Administración
            </span>
          </Link>

          <button
            onClick={() => setMenuAbierto(false)}
            className="md:hidden ml-auto text-slate-400 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6">
          {ADMIN_NAV.map((section) => (
            <div key={section.title} className="mb-8">
              <h2 className="px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                {section.title}
              </h2>

              <div className="space-y-0.5 px-3">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={() => {
                        // El detalle (`/admin/solicitudes/:id`) debe dejar
                        // marcada su sección, así que la coincidencia es por
                        // prefijo y no la de `NavLink`.
                        const activo = pathname.startsWith(item.match);

                        return `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          activo
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`;
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}

                      {item.to === ROUTES.adminSellerRequests && pendientes > 0 && (
                        <span
                          className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            pathname.startsWith(item.match)
                              ? 'bg-white text-primary'
                              : 'bg-primary text-white'
                          }`}
                        >
                          {pendientes}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold border border-slate-700 shrink-0">
              {iniciales}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {user ? `${user.nombre} ${user.apellidoPaterno}` : 'Administración'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              // Primero se sale de la zona protegida: cerrar la sesión desde
              // aquí dejaría al guard mandando al login en vez de a la portada.
              navigate(ROUTES.home, { replace: true });
              signOut();
              toast.success('Cerraste sesión.');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-8 shrink-0 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMenuAbierto(true)}
              className="md:hidden text-muted-foreground shrink-0"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm sm:text-lg font-bold text-foreground truncate">{titulo}</h1>
          </div>

          {/* El export traía aquí un buscador global y un icono de
              notificaciones. No hay endpoint de búsqueda administrativa ni
              módulo de notificaciones, así que en su lugar queda la única
              acción real: volver al marketplace. */}
          <Link
            to={ROUTES.home}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Ir al sitio</span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

/** Título de la sección activa, del mismo `handle.title` que usa la pestaña. */
function useSectionTitle(): string {
  const matches = useMatches();

  const match = [...matches]
    .reverse()
    .find((candidate) => (candidate.handle as { title?: string } | undefined)?.title);

  return (match?.handle as { title?: string } | undefined)?.title ?? 'Administración';
}
