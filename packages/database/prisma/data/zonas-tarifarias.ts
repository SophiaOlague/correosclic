export interface ZonaTarifariaData {
  codigo: string;
  descripcion: string;
  distanciaMinKm: number;
  distanciaMaxKm: number | null;
}

export const ZONAS_TARIFARIAS: ZonaTarifariaData[] = [
  {
    codigo: 'A',
    descripcion: '0 a 250 km',
    distanciaMinKm: 0,
    distanciaMaxKm: 250,
  },
  {
    codigo: 'B',
    descripcion: 'Más de 250 hasta 500 km',
    distanciaMinKm: 250,
    distanciaMaxKm: 500,
  },
  {
    codigo: 'C',
    descripcion: 'Más de 500 hasta 1000 km',
    distanciaMinKm: 500,
    distanciaMaxKm: 1000,
  },
  {
    codigo: 'D',
    descripcion: 'Más de 1000 hasta 1600 km',
    distanciaMinKm: 1000,
    distanciaMaxKm: 1600,
  },
  {
    codigo: 'E',
    descripcion: 'Más de 1600 hasta 2200 km',
    distanciaMinKm: 1600,
    distanciaMaxKm: 2200,
  },
  {
    codigo: 'F',
    descripcion: 'Más de 2200 hasta 2800 km',
    distanciaMinKm: 2200,
    distanciaMaxKm: 2800,
  },
  {
    codigo: 'G',
    descripcion: 'Más de 2800 km',
    distanciaMinKm: 2800,
    distanciaMaxKm: null,
  },
];