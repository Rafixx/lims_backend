// src/data/maquinas.ts
import { Maquina } from './types';

export const maquinas: Maquina[] = [
  { id: 'maq1', nombre: 'Termociclador A', tipo: 'PCR' },
  { id: 'maq2', nombre: 'Termociclador B', tipo: 'qPCR' },
  { id: 'maq3', nombre: 'Robot QIAamp', tipo: 'Extracción DNA' },
  { id: 'maq4', nombre: 'Robot Chemagic', tipo: 'Extracción DNA' },
  { id: 'maq5', nombre: 'Equipo mirVana', tipo: 'Extracción miRNA' },
  { id: 'maq6', nombre: 'Equipo miRNeasy', tipo: 'Extracción miRNA' },
  { id: 'maq7', nombre: 'Sistema de Electroforesis', tipo: 'Electroforesis' },
  { id: 'maq8', nombre: 'Nanodrop', tipo: 'Cuantificación' },
  { id: 'maq9', nombre: 'Qubit', tipo: 'Cuantificación' },
  { id: 'maq10', nombre: 'QC Arrays EPIC Machine', tipo: 'QC Arrays' },
];
