// src/routes/muestra.routes.ts
import { Router } from 'express';
import {
  getMuestras,
  getMuestraById,
  getTecnicasById,
  createMuestra,
  updateMuestra,
  deleteMuestra,
  getMuestrasStats,
} from '../controllers/muestra.controller';

const router = Router();

router.get('/', getMuestras);
router.get('/estadisticas', getMuestrasStats);
router.get('/:id', getMuestraById);
router.get('/:id/tecnicas', getTecnicasById);
router.post('/', createMuestra);
router.put('/:id', updateMuestra);
router.delete('/:id', deleteMuestra);

export { router as muestraRoutes };
