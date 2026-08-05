import { z } from 'zod';

/**
 * Estos esquemas replican campo a campo las reglas de `class-validator` de
 * `LoginDto` y `RegisterDto` en el backend, incluidos sus mensajes en español.
 * Validar aquí evita viajes de ida y vuelta, pero el backend sigue siendo la
 * autoridad: cualquier discrepancia se resuelve a favor del DTO.
 *
 * Backend: `apps/backend/src/auth/dto/`.
 */

/** `@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,64}$/)` */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,64}$/;

/** `@Matches(/^\+[1-9]\d{1,14}$/)` — formato E.164. */
const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Ingresa tu correo electrónico.')
    .email('El correo electrónico no tiene un formato válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
  /** Solo del cliente: decide si la sesión se guarda entre visitas. */
  remember: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    nombre: z
      .string()
      .min(1, 'Ingresa tu nombre.')
      .max(100, 'El nombre no puede superar los 100 caracteres.'),
    apellidoPaterno: z
      .string()
      .min(1, 'Ingresa tu apellido paterno.')
      .max(100, 'El apellido paterno no puede superar los 100 caracteres.'),
    apellidoMaterno: z
      .string()
      .max(100, 'El apellido materno no puede superar los 100 caracteres.')
      .optional()
      .or(z.literal('')),
    email: z
      .string()
      .min(1, 'Ingresa tu correo electrónico.')
      .email('El correo electrónico no tiene un formato válido.')
      .max(255, 'El correo electrónico no puede superar los 255 caracteres.'),
    telefono: z
      .string()
      .regex(
        PHONE_REGEX,
        'El teléfono debe estar en formato internacional E.164. Ejemplo: +526181234567.',
      )
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(1, 'Ingresa una contraseña.')
      .regex(
        PASSWORD_REGEX,
        'La contraseña debe contener entre 8 y 64 caracteres, incluyendo al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.',
      ),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'Debes aceptar los términos y condiciones.' }),
    }),
  })
  // Equivale a la comprobación de `AuthService.register`, que lanza
  // PasswordMismatchException cuando password !== confirmPassword.
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden.',
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/** Campos del formulario de registro, para mapear errores 400 del backend. */
export const REGISTER_FIELDS = [
  'nombre',
  'apellidoPaterno',
  'apellidoMaterno',
  'email',
  'telefono',
  'password',
  'confirmPassword',
  'acceptTerms',
] as const;

export const LOGIN_FIELDS = ['email', 'password'] as const;
