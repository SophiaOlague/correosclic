import { FileText, Receipt, Send, type LucideIcon } from 'lucide-react';

import type { SellerDocumentType, SellerRequestDto } from '@/types/seller';

/**
 * El asistente de onboarding no lleva estado propio: cada paso se deriva de
 * `pasoActual` y `estado`, que escribe el backend.
 *
 * `PasoSolicitudVendedor` tiene cinco valores; los tres primeros son los que el
 * vendedor recorre. `REVISION` significa que ya se envió y `FINALIZADA` que el
 * proceso terminó, así que ninguno de los dos es un paso editable.
 */
export const ONBOARDING_STEPS = [
  {
    key: 'INFORMACION_FISCAL',
    label: 'Información fiscal',
    description: 'RFC, razón social y régimen fiscal.',
    icon: Receipt,
  },
  {
    key: 'DOCUMENTOS',
    label: 'Documentos',
    description: 'Identificación, constancia fiscal y comprobante de domicilio.',
    icon: FileText,
  },
  {
    key: 'REVISION',
    label: 'Envío a revisión',
    description: 'Confirma tus datos y envía la solicitud.',
    icon: Send,
  },
] as const satisfies readonly {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
}[];

export type OnboardingStepKey = (typeof ONBOARDING_STEPS)[number]['key'];

/**
 * Paso en el que el vendedor debe actuar.
 *
 * Se calcula a partir de lo que el backend ya tiene registrado, no de
 * `pasoActual` a secas: `pasoActual` pasa a `REVISION` en cuanto se suben los
 * tres documentos, pero la solicitud aún no se ha enviado, y esa distinción es
 * justo la del último paso.
 */
export function currentStep(request: SellerRequestDto): OnboardingStepKey {
  if (!request.informacionFiscal) return 'INFORMACION_FISCAL';

  if (request.documentos.length < REQUIRED_DOCUMENTS.length) return 'DOCUMENTOS';

  return 'REVISION';
}

/** Índice del paso, para pintar el stepper. */
export function stepIndex(step: OnboardingStepKey): number {
  return ONBOARDING_STEPS.findIndex((item) => item.key === step);
}

/**
 * Documentos que `submitRequest` exige en el backend. Los tres son
 * obligatorios y no hay forma de sustituir uno por otro.
 */
export const REQUIRED_DOCUMENTS: {
  tipo: SellerDocumentType;
  label: string;
  hint: string;
}[] = [
  {
    tipo: 'INE',
    label: 'Identificación oficial (INE)',
    hint: 'Ambos lados en un solo archivo, legible.',
  },
  {
    tipo: 'CONSTANCIA_SITUACION_FISCAL',
    label: 'Constancia de situación fiscal',
    hint: 'Emitida por el SAT, con antigüedad menor a 3 meses.',
  },
  {
    tipo: 'COMPROBANTE_DOMICILIO',
    label: 'Comprobante de domicilio',
    hint: 'Recibo de luz, agua o teléfono a tu nombre.',
  },
];

/** `true` si ya se subió ese tipo de documento. */
export function hasDocument(
  request: SellerRequestDto,
  tipo: SellerDocumentType,
): boolean {
  return request.documentos.some((documento) => documento.tipoDocumento === tipo);
}

/** La solicitud ya se envió y está esperando resolución. */
export function isUnderReview(request: SellerRequestDto): boolean {
  return request.estado === 'PENDIENTE' && request.pasoActual === 'REVISION';
}

/**
 * Formatos que acepta `POST /storage/uploads`, tal como los valida el backend
 * (`FileTypeValidator` + `MaxFileSizeValidator`).
 */
export const UPLOAD_ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf';
export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
