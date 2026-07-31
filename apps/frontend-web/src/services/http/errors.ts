/**
 * Forma del cuerpo de error que devuelve NestJS.
 *
 * `ValidationPipe` (whitelist + forbidNonWhitelisted) responde 400 con
 * `message` como array de strings — un mensaje por regla de `class-validator`
 * incumplida. Las excepciones de dominio del backend responden con `message`
 * como string simple.
 */
interface NestErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  /**
   * Detalle extra que añaden algunas excepciones de dominio. Por ejemplo
   * `OrderStockConflictException` responde 409 con el motivo por producto.
   */
  warnings?: string[];
}

export class ApiError extends Error {
  readonly status: number;
  /** Lista completa de mensajes devueltos por el backend. */
  readonly messages: string[];
  /** Etiqueta corta de NestJS: `Bad Request`, `Unauthorized`, ... */
  readonly error?: string;
  /** Detalle por elemento cuando la excepción lo incluye. */
  readonly warnings: string[];

  constructor(status: number, messages: string[], error?: string, warnings: string[] = []) {
    super(messages[0] ?? 'Ocurrió un error inesperado.');
    this.name = 'ApiError';
    this.status = status;
    this.messages = messages;
    this.error = error;
    this.warnings = warnings;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidation(): boolean {
    return this.status === 400 || this.status === 422;
  }

  /** Errores de conflicto de negocio: stock, estado inválido, duplicados. */
  get isConflict(): boolean {
    return this.status === 409;
  }
}

/** Error de red: el servidor no respondió (API caída, CORS, sin conexión). */
export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super('No se pudo conectar con el servidor. Revisa tu conexión.');
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

export function toApiError(status: number, body: unknown): ApiError {
  const parsed = (body ?? {}) as NestErrorBody;

  // Un 5xx nunca trae un mensaje útil para el usuario: NestJS responde
  // "Internal server error". Se prefiere el texto propio en español.
  if (status >= 500) {
    return new ApiError(status, [defaultMessageFor(status)], parsed.error);
  }

  const messages = Array.isArray(parsed.message)
    ? parsed.message
    : parsed.message
      ? [parsed.message]
      : [defaultMessageFor(status)];

  return new ApiError(
    status,
    messages,
    parsed.error,
    Array.isArray(parsed.warnings) ? parsed.warnings : [],
  );
}

function defaultMessageFor(status: number): string {
  switch (status) {
    case 400:
      return 'La información enviada no es válida.';
    case 401:
      return 'Tu sesión expiró. Inicia sesión de nuevo.';
    case 403:
      return 'No tienes permiso para realizar esta acción.';
    case 404:
      return 'No encontramos lo que buscas.';
    case 409:
      return 'La operación entra en conflicto con el estado actual.';
    case 500:
      return 'El servidor no pudo completar la operación. Inténtalo de nuevo.';
    default:
      return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  }
}

/**
 * Agrupa los mensajes de `class-validator` por campo, para alimentar
 * `setError` de React Hook Form.
 *
 * Los mensajes del backend de CorreosClic están redactados en español y no
 * siempre empiezan con el nombre del campo, así que el emparejamiento se hace
 * contra la lista de campos del formulario que recibe la función.
 */
export function mapValidationMessages(
  error: ApiError,
  fields: readonly string[],
): { fieldErrors: Record<string, string>; formErrors: string[] } {
  const fieldErrors: Record<string, string> = {};
  const formErrors: string[] = [];

  for (const message of error.messages) {
    const field = fields.find((candidate) =>
      new RegExp(`\\b${candidate}\\b`, 'i').test(message),
    );

    if (field && !fieldErrors[field]) {
      fieldErrors[field] = message;
    } else {
      formErrors.push(message);
    }
  }

  return { fieldErrors, formErrors };
}
