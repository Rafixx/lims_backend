// src/data/tecnicas.ts
import { Tecnica } from './tipos';

export const tecnicas: Tecnica[] = [
  {
    id: 'tec1',
    nombre: 'PCR Convencional',
    productoId: 'prod1',
    maquinaId: 'maq1',
    parametros: { volumen: '50µL', ciclos: 35 },
  },
  {
    id: 'tec2',
    nombre: 'RT-PCR',
    productoId: 'prod1',
    maquinaId: 'maq1',
    parametros: { volumen: '50µL', ciclos: 40 },
  },
  {
    id: 'tec3',
    nombre: 'qPCR',
    productoId: 'prod2',
    maquinaId: 'maq2',
    parametros: { volumen: '20µL', ciclos: 40 },
  },
  {
    id: 'tec4',
    nombre: 'Extracción de DNA con QIAamp',
    productoId: 'prod3',
    maquinaId: 'maq3',
    parametros: { volumen: '200µL' },
  },
  {
    id: 'tec5',
    nombre: 'Extracción de DNA con Chemagic',
    productoId: 'prod3',
    maquinaId: 'maq4',
    parametros: { volumen: '200µL' },
  },
  {
    id: 'tec6',
    nombre: 'Extracción de miRNA con mirVana',
    productoId: 'prod4',
    maquinaId: 'maq5',
    parametros: { volumen: '100µL' },
  },
  {
    id: 'tec7',
    nombre: 'Extracción de miRNA con miRNeasy',
    productoId: 'prod4',
    maquinaId: 'maq6',
    parametros: { volumen: '100µL' },
  },
  {
    id: 'tec8',
    nombre: 'Electroforesis',
    productoId: 'prod5',
    maquinaId: 'maq7',
    parametros: { gel: '1%', tiempo: '30min' },
  },
  {
    id: 'tec9',
    nombre: 'Cuantificación con Nanodrop',
    productoId: 'prod5',
    maquinaId: 'maq8',
    parametros: { ratio: 'A260/A280' },
  },
  {
    id: 'tec10',
    nombre: 'Cuantificación con Qubit',
    productoId: 'prod5',
    maquinaId: 'maq9',
    parametros: { fluorimetria: true },
  },
  {
    id: 'tec11',
    nombre: 'QC Arrays EPIC',
    productoId: 'prod5',
    maquinaId: 'maq10',
    parametros: { arrays: true },
  },
  {
    id: 'tec12',
    nombre: 'Diluciones',
    productoId: 'prod6',
    maquinaId: null,
    parametros: { factor: 10 },
  },
];
