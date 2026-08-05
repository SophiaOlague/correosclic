import { useEffect } from 'react';
import { useMatches } from 'react-router';

const DEFAULT_TITLE = 'CorreosClic - Todo México, en un solo clic';

interface TitleHandle {
  title?: string;
}

/**
 * Fija el `document.title` a partir del `handle.title` de la ruta activa,
 * sustituyendo la cadena de ternarios que el export tenía dentro de `App()`.
 */
export function useDocumentTitle(): void {
  const matches = useMatches();

  useEffect(() => {
    const match = [...matches]
      .reverse()
      .find((candidate) => (candidate.handle as TitleHandle | undefined)?.title);

    const title = (match?.handle as TitleHandle | undefined)?.title;

    document.title = title ? `${title} - CorreosClic` : DEFAULT_TITLE;
  }, [matches]);
}
