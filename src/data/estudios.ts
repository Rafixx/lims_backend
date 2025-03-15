//src/data/productos.ts
import { Estudio } from './tipos';

export const estudios: Estudio[] = [
  {
    id: 'prod1',
    nombre: 'PCR Convencional / RT-PCR',
    procesos: [
      {
        id: 'tec1',
        nombre: 'PCR Convencional',
        productoId: 'prod1',
        aparatoId: 'maq1',
        parametros: { volumen: '50µL', ciclos: 35 },
      },
    ],
  },
  {
    id: 'prod2',
    nombre: 'qPCR',
    procesos: [
      {
        id: 'tec1',
        nombre: 'PCR Convencional',
        productoId: 'prod1',
        aparatoId: 'maq1',
        parametros: { volumen: '50µL', ciclos: 35 },
      },
    ],
  },
  {
    id: 'prod3',
    nombre: 'Extracción de DNA',
    procesos: [
      {
        id: 'tec1',
        nombre: 'PCR Convencional',
        productoId: 'prod1',
        aparatoId: 'maq1',
        parametros: { volumen: '50µL', ciclos: 35 },
      },
    ],
  },
  {
    id: 'prod4',
    nombre: 'Extracción de miRNA',
    procesos: [
      {
        id: 'tec1',
        nombre: 'PCR Convencional',
        productoId: 'prod1',
        aparatoId: 'maq1',
        parametros: { volumen: '50µL', ciclos: 35 },
      },
    ],
  },
  {
    id: 'prod5',
    nombre: 'Electroforesis y Cuantificación',
    procesos: [
      {
        id: 'tec1',
        nombre: 'PCR Convencional',
        productoId: 'prod1',
        aparatoId: 'maq1',
        parametros: { volumen: '50µL', ciclos: 35 },
      },
    ],
  },
  {
    id: 'prod6',
    nombre: 'Diluciones',
    procesos: [
      {
        id: 'tec1',
        nombre: 'PCR Convencional',
        productoId: 'prod1',
        aparatoId: 'maq1',
        parametros: { volumen: '50µL', ciclos: 35 },
      },
    ],
  },
];
