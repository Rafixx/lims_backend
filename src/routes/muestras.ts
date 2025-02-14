// src/routes/muestras.ts
import { Router } from 'express';

export interface Muestra {
  id: number;
  codigoInterno: string;
  estado: string;
}

export const muestras: Muestra[] = [
  { id: 1, codigoInterno: 'M001', estado: 'Pendiente' },
  { id: 2, codigoInterno: 'M002', estado: 'En Proceso' },
  { id: 3, codigoInterno: 'M003', estado: 'Pendiente' },
  { id: 4, codigoInterno: 'M004', estado: 'Pendiente' },
  { id: 5, codigoInterno: 'M005', estado: 'En Proceso' },
];

/**
 * Función para actualizar el estado de una muestra.
 * Busca la muestra por id y alterna su estado entre 'Pendiente' y 'Actualizado'.
 * @param id - Identificador de la muestra a actualizar.
 * @returns La muestra actualizada, o undefined si no se encontró.
 */
export const actualizarMuestra = (id: number): Muestra | undefined => {
  const muestra = muestras.find((m) => m.id === id);
  if (muestra) {
    // Alterna el estado: si es 'Pendiente' pasa a 'Actualizado'; de lo contrario, vuelve a 'Pendiente'
    muestra.estado =
      muestra.estado === 'Pendiente' ? 'Actualizado' : 'Pendiente';
  }
  return muestra;
};

const router = Router();

// Endpoint GET /api/muestras: devuelve la lista completa de muestras
router.get('/', (req, res) => {
  res.json(muestras);
});

// Aquí podrías agregar otros endpoints para POST, PUT o DELETE según lo necesites.

export default router;
