// src/routes/muestra.routes.ts
import { Router } from 'express';
import {
  getMuestras,
  getMuestraById,
  createMuestra,
  updateMuestra,
  deleteMuestra,
} from '../controllers/muestra.controller';

const router = Router();

router.get('/', getMuestras);
router.get('/:id', getMuestraById);
router.post('/', createMuestra);
router.put('/:id', updateMuestra);
router.delete('/:id', deleteMuestra);

export { router as muestraRoutes };
