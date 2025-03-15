// src/routes/proceso.routes.ts
import { Router } from 'express';
import {
  getProcesos,
  getProcesoById,
  createProceso,
  updateProceso,
  deleteProceso,
} from '../controllers/proceso.controller';

const procesoRoutes = Router();

procesoRoutes.get('/', getProcesos);
procesoRoutes.get('/:id', getProcesoById);
procesoRoutes.post('/', createProceso);
procesoRoutes.put('/:id', updateProceso);
procesoRoutes.delete('/:id', deleteProceso);

export default procesoRoutes;
