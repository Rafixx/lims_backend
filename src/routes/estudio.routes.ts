// src/routes/estudio.routes.ts
import { Router } from 'express';
import {
  getEstudios,
  getEstudioById,
  createEstudio,
  updateEstudio,
  deleteEstudio,
} from '../controllers/estudio.controller';

const estudioRoutes = Router();

estudioRoutes.get('/', getEstudios);
estudioRoutes.get('/:id', getEstudioById);
estudioRoutes.post('/', createEstudio);
estudioRoutes.put('/:id', updateEstudio);
estudioRoutes.delete('/:id', deleteEstudio);

export default estudioRoutes;
