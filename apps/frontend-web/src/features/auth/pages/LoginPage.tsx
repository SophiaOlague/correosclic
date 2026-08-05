import { zodResolver } from '@hookform/resolvers/zod';
import { Chrome, Lock, Mail, Smartphone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { ROUTES } from '@/constants/routes';

import { AuthCheckbox } from '../components/AuthCheckbox';
import { AuthField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import { SubmitButton } from '../components/SubmitButton';
import { useLoginMutation } from '../hooks/useAuthMutations';
import { LOGIN_FIELDS, loginSchema, type LoginFormValues } from '../schemas/auth.schemas';

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  });

  const login = useLoginMutation<LoginFormValues>(setError, LOGIN_FIELDS);

  return (
    <AuthLayout isLogin>
      <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-3">Hola de nuevo</h1>
      <p className="text-muted-foreground mb-8 text-sm sm:text-base">
        Ingresa tus datos para acceder a tu cuenta.
      </p>

      <form className="space-y-5" noValidate onSubmit={handleSubmit((values) => login.mutate(values))}>
        <AuthField
          {...register('email')}
          label="Correo electrónico"
          icon={Mail}
          type="email"
          size="lg"
          autoComplete="email"
          placeholder="tu@correo.com"
          error={errors.email?.message}
        />

        <AuthField
          {...register('password')}
          label="Contraseña"
          icon={Lock}
          size="lg"
          revealable
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
        />

        <div className="flex items-center justify-between">
          <AuthCheckbox {...register('remember')}>Recordarme</AuthCheckbox>

          {/* TODO: Backend integration pending — no existe endpoint de recuperación de contraseña. */}
          <button
            type="button"
            onClick={() =>
              toast.info('La recuperación de contraseña estará disponible próximamente.')
            }
            className="text-sm font-bold text-primary hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <SubmitButton isLoading={login.isPending} loadingLabel="Iniciando sesión..." className="mt-2">
          Iniciar sesión
        </SubmitButton>
      </form>

      <div className="mt-8 flex items-center gap-4 before:flex-1 before:h-px before:bg-border after:flex-1 after:h-px after:bg-border">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          O continúa con
        </span>
      </div>

      {/* TODO: Backend integration pending — el backend no expone OAuth. */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {[
          { label: 'Google', Icon: Chrome },
          { label: 'Apple', Icon: Smartphone },
        ].map(({ label, Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => toast.info(`El acceso con ${label} estará disponible próximamente.`)}
            className="flex items-center justify-center gap-2 h-12 bg-white border-2 border-border rounded-xl font-bold text-sm text-foreground hover:bg-[#F5F6F8] transition-colors"
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <p className="text-center mt-10 text-sm font-medium text-muted-foreground">
        ¿No tienes una cuenta?{' '}
        <Link to={ROUTES.register} className="text-primary font-bold hover:underline">
          Regístrate
        </Link>
      </p>
    </AuthLayout>
  );
}
