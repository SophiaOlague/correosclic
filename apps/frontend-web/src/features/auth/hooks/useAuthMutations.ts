import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';

import { useAuth } from '@/hooks/useAuth';
import { authApi, type LoginPayload, type RegisterPayload } from '@/services/api/auth.api';
import { ApiError, mapValidationMessages, NetworkError } from '@/services/http';
import type { AuthSession } from '@/types/auth';

import { landingRouteFor } from '../lib/role-landing';

interface LocationState {
  from?: string;
}

/**
 * Traslada un error del backend al formulario: los mensajes de
 * `class-validator` se anclan a su campo y el resto se muestra como toast.
 */
function useApiErrorHandler<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fields: readonly string[],
) {
  return useCallback(
    (error: unknown) => {
      if (error instanceof NetworkError) {
        toast.error(error.message);
        return;
      }

      if (!(error instanceof ApiError)) {
        toast.error('Ocurrió un error inesperado. Inténtalo de nuevo.');
        return;
      }

      if (error.isValidation) {
        const { fieldErrors, formErrors } = mapValidationMessages(error, fields);

        for (const [field, message] of Object.entries(fieldErrors)) {
          setError(field as Path<T>, { type: 'server', message });
        }

        if (formErrors.length > 0) {
          toast.error(formErrors[0]);
        } else if (Object.keys(fieldErrors).length === 0) {
          toast.error(error.message);
        }

        return;
      }

      // 401 en login son credenciales inválidas; 409 es correo duplicado.
      toast.error(error.message);
    },
    [setError, fields],
  );
}

/** `POST /auth/login` */
export function useLoginMutation<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fields: readonly string[],
) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleError = useApiErrorHandler(setError, fields);

  return useMutation({
    mutationFn: (payload: LoginPayload & { remember: boolean }) =>
      authApi.login({ email: payload.email, password: payload.password }),

    onSuccess: (session: AuthSession, variables) => {
      signIn(session, { remember: variables.remember });

      toast.success(`Hola de nuevo, ${session.user.nombre}.`);

      // Si el usuario fue redirigido aquí desde una ruta protegida, se le
      // devuelve a ella; si no, al panel que le corresponda por rol.
      const from = (location.state as LocationState | null)?.from;

      navigate(from ?? landingRouteFor(session.user.roles), { replace: true });
    },

    onError: handleError,
  });
}

/** `POST /auth/register` — el backend devuelve la sesión ya iniciada. */
export function useRegisterMutation<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fields: readonly string[],
) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const handleError = useApiErrorHandler(setError, fields);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),

    onSuccess: (session: AuthSession) => {
      signIn(session, { remember: true });

      toast.success('¡Cuenta creada con éxito!');

      navigate(landingRouteFor(session.user.roles), { replace: true });
    },

    onError: handleError,
  });
}
