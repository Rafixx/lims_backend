// src/data/placas.ts
import { Placa } from './tipos';

export const placas: Placa[] = [
  {
    id: 'placa1',
    codigoPlaca: 'PLACA-001',
    estado: 'Procesando',
    numeroMuestras: 96,
    muestras: [
      { id: 'muestra3', posicion: 'A1' },
      { id: 'muestra4', posicion: 'A2' },
      { id: 'muestra5', posicion: 'B1' },
    ],
  },
];
