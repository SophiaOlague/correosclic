import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, Phone, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

import { ROUTES } from '@/constants/routes';

import { AuthCheckbox } from '../components/AuthCheckbox';
import { AuthField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import { SubmitButton } from '../components/SubmitButton';
import { useRegisterMutation } from '../hooks/useAuthMutations';
import {
  REGISTER_FIELDS,
  registerSchema,
  type RegisterFormValues,
} from '../schemas/auth.schemas';

/**
 * El diseño original pedía un único campo "Nombre completo" y no contemplaba
 * confirmación de contraseña. `RegisterDto` exige `nombre`, `apellidoPaterno`
 * y `confirmPassword` por separado, así que el formulario se amplió respetando
 * el mismo lenguaje visual. `apellidoMaterno` y `telefono` se incluyen porque
 * el DTO los acepta como opcionales.
 */
export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      telefono: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false as unknown as true,
    },
  });

  const createAccount = useRegisterMutation<RegisterFormValues>(setError, REGISTER_FIELDS);

  return (
    <AuthLayout isLogin={false}>
      <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-3">Crear cuenta</h1>
      <p className="text-muted-foreground mb-8 text-sm sm:text-base">
        Únete y empieza a comprar de forma segura.
      </p>

      <form
        className="space-y-4"
        noValidate
        onSubmit={handleSubmit((values) =>
          createAccount.mutate({
            nombre: values.nombre,
            apellidoPaterno: values.apellidoPaterno,
            // Los opcionales se omiten si van vacíos: el ValidationPipe del
            // backend usa forbidNonWhitelisted y una cadena vacía no pasaría
            // las reglas de longitud ni el formato E.164.
            ...(values.apellidoMaterno ? { apellidoMaterno: values.apellidoMaterno } : {}),
            ...(values.telefono ? { telefono: values.telefono } : {}),
            email: values.email,
            password: values.password,
            confirmPassword: values.confirmPassword,
            acceptTerms: values.acceptTerms,
          }),
        )}
      >
        <AuthField
          {...register('nombre')}
          label="Nombre(s)"
          icon={User}
          autoComplete="given-name"
          placeholder="Ej. María"
          error={errors.nombre?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AuthField
            {...register('apellidoPaterno')}
            label="Apellido paterno"
            icon={User}
            autoComplete="family-name"
            placeholder="Ej. González"
            error={errors.apellidoPaterno?.message}
          />

          <AuthField
            {...register('apellidoMaterno')}
            label="Apellido materno (opcional)"
            icon={User}
            autoComplete="additional-name"
            placeholder="Ej. Ramírez"
            error={errors.apellidoMaterno?.message}
          />
        </div>

        <AuthField
          {...register('email')}
          label="Correo electrónico"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          error={errors.email?.message}
        />

        <AuthField
          {...register('telefono')}
          label="Teléfono (opcional)"
          icon={Phone}
          type="tel"
          autoComplete="tel"
          placeholder="+526181234567"
          error={errors.telefono?.message}
        />

        <AuthField
          {...register('password')}
          label="Contraseña"
          icon={Lock}
          revealable
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
        />

        <AuthField
          {...register('confirmPassword')}
          label="Confirmar contraseña"
          icon={Lock}
          revealable
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          error={errors.confirmPassword?.message}
        />

        <div className="pt-2">
          <AuthCheckbox {...register('acceptTerms')} align="start" error={errors.acceptTerms?.message}>
            Acepto los{' '}
            <a href="#" className="text-primary font-bold hover:underline">
              Términos y Condiciones
            </a>{' '}
            y el{' '}
            <a href="#" className="text-primary font-bold hover:underline">
              Aviso de Privacidad
            </a>
            .
          </AuthCheckbox>
        </div>

        <SubmitButton
          isLoading={createAccount.isPending}
          loadingLabel="Creando cuenta..."
          className="mt-4"
        >
          Crear cuenta
        </SubmitButton>
      </form>

      <p className="text-center mt-10 text-sm font-medium text-muted-foreground">
        ¿Ya tienes una cuenta?{' '}
        <Link to={ROUTES.login} className="text-primary font-bold hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
