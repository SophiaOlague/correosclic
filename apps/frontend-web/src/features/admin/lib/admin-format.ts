/** Formatos de fecha del panel, sobre las cadenas ISO que devuelve el backend. */
const DATE = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const DATE_TIME = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatAdminDate(iso: string): string {
  const date = new Date(iso);

  return Number.isNaN(date.getTime()) ? '' : DATE.format(date);
}

export function formatAdminDateTime(iso: string): string {
  const date = new Date(iso);

  return Number.isNaN(date.getTime()) ? '' : DATE_TIME.format(date);
}

/**
 * Etiquetas de `TipoDocumentoVendedor`. El backend devuelve el valor del enum
 * tal cual (`CONSTANCIA_SITUACION_FISCAL`), que no es texto de interfaz.
 */
const DOCUMENT_LABELS: Record<string, string> = {
  INE: 'Identificación oficial (INE)',
  CONSTANCIA_SITUACION_FISCAL: 'Constancia de situación fiscal',
  COMPROBANTE_DOMICILIO: 'Comprobante de domicilio',
};

export function documentLabel(tipoDocumento: string): string {
  return DOCUMENT_LABELS[tipoDocumento] ?? tipoDocumento;
}
