// src/routes/muestra.routes.ts
import { Router } from 'express';
import {
  getMuestras,
  getMuestraById,
  createMuestra,
  updateMuestra,
  deleteMuestra,
  updateMuestraEstado,
} from '../controllers/muestras.controller';

const muestraRoutes = Router();

muestraRoutes.get('/', getMuestras);
muestraRoutes.get('/:id', getMuestraById);
muestraRoutes.post('/', createMuestra);
muestraRoutes.put('/:id', updateMuestra);
muestraRoutes.delete('/:id', deleteMuestra);

// Ruta para actualizar el estado de una muestra
muestraRoutes.put('/:id/estado', updateMuestraEstado);

export default muestraRoutes;
