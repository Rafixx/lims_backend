//src/data/productos.ts
import { Producto } from './types';

export const productos: Producto[] = [
  {
    id: 'prod1',
    nombre: 'PCR Convencional / RT-PCR',
    tecnicas: ['tec1', 'tec2'],
  },
  { id: 'prod2', nombre: 'qPCR', tecnicas: ['tec3'] },
  { id: 'prod3', nombre: 'Extracción de DNA', tecnicas: ['tec4', 'tec5'] },
  { id: 'prod4', nombre: 'Extracción de miRNA', tecnicas: ['tec6', 'tec7'] },
  {
    id: 'prod5',
    nombre: 'Electroforesis y Cuantificación',
    tecnicas: ['tec8', 'tec9', 'tec10', 'tec11'],
  },
  { id: 'prod6', nombre: 'Diluciones', tecnicas: ['tec12'] },
];
