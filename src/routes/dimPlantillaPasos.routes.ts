// src/routes/dimPlantillaPasos.routes.ts
import { Router } from 'express';
import {
  getAllDimPlantillaPasos,
  getDimPlantillaPasosById,
  createDimPlantillaPasos,
  updateDimPlantillaPasos,
  deleteDimPlantillaPasos,
} from '../controllers/dimPlantillaPasos.controller';

const router = Router();

router.get('/', getAllDimPlantillaPasos);
router.get('/:id', getDimPlantillaPasosById);
router.post('/', createDimPlantillaPasos);
router.put('/:id', updateDimPlantillaPasos);
router.delete('/:id', deleteDimPlantillaPasos);

export { router as dimPlantillaPasosRoutes };
