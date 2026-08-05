import { Check, FileText, Loader2, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';

import type { SellerDocumentDto, SellerDocumentType } from '@/types/seller';

import { UPLOAD_ACCEPT, UPLOAD_MAX_BYTES } from '../lib/onboarding-steps';

/**
 * Carga de un documento obligatorio.
 *
 * El backend guarda una URL, así que son dos pasos: subir el archivo a R2 y
 * registrar el documento. El componente solo informa del hecho; el
 * encadenamiento vive en `useUploadSellerDocument`.
 *
 * Un documento ya cargado no se puede reemplazar: `addDocument` responde 409
 * si ya existe uno de ese tipo, así que la fila se muestra en estado
 * consolidado en vez de ofrecer un botón que fallaría.
 */
export function DocumentUploader({
  label,
  hint,
  tipo,
  cargado,
  isPending,
  onUpload,
}: {
  label: string;
  hint: string;
  tipo: SellerDocumentType;
  cargado: SellerDocumentDto | undefined;
  isPending: boolean;
  onUpload: (tipo: SellerDocumentType, file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const seleccionar = (file: File | undefined) => {
    setErrorLocal(null);

    if (!file) return;

    // Se valida antes de salir a la red con las mismas reglas del backend.
    if (file.size > UPLOAD_MAX_BYTES) {
      setErrorLocal('El archivo no puede superar los 5 MB.');
      return;
    }

    if (!UPLOAD_ACCEPT.split(',').includes(file.type)) {
      setErrorLocal('Formato no admitido. Usa JPG, PNG, WEBP o PDF.');
      return;
    }

    onUpload(tipo, file);
  };

  if (cargado) {
    return (
      <div className="flex items-start gap-4 p-4 rounded-xl border border-[#006847]/20 bg-[#006847]/5">
        <span className="w-9 h-9 rounded-lg bg-[#006847] text-white flex items-center justify-center shrink-0">
          <Check className="w-5 h-5" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {cargado.nombreArchivo}
          </p>
          <a
            href={cargado.urlArchivo}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-primary hover:underline mt-1 inline-block"
          >
            Ver documento
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border">
      <div className="flex items-start gap-4">
        <span className="w-9 h-9 rounded-lg bg-[#F5F6F8] text-muted-foreground flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_ACCEPT}
        className="sr-only"
        aria-label={`Subir ${label}`}
        onChange={(event) => {
          seleccionar(event.target.files?.[0]);
          // Permite volver a elegir el mismo archivo tras un fallo.
          event.target.value = '';
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="w-full mt-4 bg-[#F5F6F8] border border-dashed border-border hover:border-primary hover:text-primary rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <UploadCloud className="w-4 h-4" />
        )}
        {isPending ? 'Subiendo...' : 'Subir archivo'}
      </button>

      {errorLocal && (
        <p className="text-xs font-semibold text-destructive mt-2">{errorLocal}</p>
      )}
    </div>
  );
}
