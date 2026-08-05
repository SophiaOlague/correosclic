import { ChevronRight, LogOut, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { EmptyState } from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

import { ROLE_ACCESSES, roleLabel } from '../lib/role-access';

/**
 * Mi cuenta: punto de entrada del usuario autenticado.
 *
 * Muestra **solo lo que la sesión ya conoce** —`AuthenticatedUserDto`: nombre,
 * correo y roles— más los accesos a las pantallas que le corresponden y el
 * cierre de sesión. No hay ninguna llamada propia porque no hay a qué
 * llamarla: el backend no expone un módulo de Usuarios.
 *
 * Por eso la pantalla del export —favoritos, direcciones, métodos de pago,
 * seguridad y edición de perfil— no se conservó ni siquiera deshabilitada:
 * eran controles sin ningún endpoint detrás. Quedan documentados en
 * `PENDING_INTEGRATIONS.md` como el futuro módulo de Usuarios.
 */
export default function AccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const nombreCompleto = [user.nombre, user.apellidoPaterno, user.apellidoMaterno]
    .filter(Boolean)
    .join(' ');

  const iniciales =
    `${user.nombre.charAt(0)}${user.apellidoPaterno.charAt(0)}`.toUpperCase();

  const accesos = ROLE_ACCESSES.filter((acceso) => user.roles.includes(acceso.role));

  return (
    <div className="bg-[#F5F6F8] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-black text-foreground mb-6">Mi cuenta</h1>

        <section className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-black shadow-sm shadow-primary/20 shrink-0">
              {iniciales}
            </div>

            <div className="min-w-0">
              <p className="text-lg font-black text-foreground truncate">{nombreCompleto}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                {user.email}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {user.roles.length === 1 ? 'Rol' : 'Roles'}
            </p>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <span
                  key={role}
                  className="bg-[#F5F6F8] text-foreground text-xs font-bold px-3 py-1.5 rounded-lg"
                >
                  {roleLabel(role)}
                </span>
              ))}
            </div>
          </div>
        </section>

        {accesos.length > 0 ? (
          <section className="space-y-3 mb-6">
            {accesos.map((acceso) => {
              const Icon = acceso.icon;

              return (
                <Link
                  key={acceso.to}
                  to={acceso.to}
                  className="bg-white rounded-2xl border border-border shadow-sm p-5 flex items-center gap-4 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#F5F6F8] flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground">{acceso.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {acceso.description}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </section>
        ) : (
          /* Le pasa a ADMIN_LOCAL y ADMIN_REGIONAL: tienen rol, pero todavía no
             existe ninguna pantalla para ellos. */
          <div className="mb-6">
            <EmptyState
              title="Tu rol todavía no tiene un panel propio"
              description="Cuando existan las pantallas correspondientes aparecerán aquí. Mientras tanto puedes seguir navegando por el marketplace."
              action={
                <Link
                  to={ROUTES.catalog}
                  className="bg-primary text-white px-6 h-11 inline-flex items-center rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
                >
                  Ir al catálogo
                </Link>
              }
            />
          </div>
        )}

        <button
          onClick={() => {
            // Primero se sale de la zona protegida: cerrar la sesión estando
            // aquí dejaría al guard mandando al login en vez de a la portada.
            navigate(ROUTES.home, { replace: true });
            signOut();
            toast.success('Cerraste sesión.');
          }}
          className="w-full bg-white border border-border text-destructive h-12 rounded-2xl font-bold hover:bg-destructive/5 hover:border-destructive/30 transition-colors inline-flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
