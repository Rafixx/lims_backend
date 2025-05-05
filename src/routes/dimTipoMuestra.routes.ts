// src/routes/dimTipoMuestra.routes.ts
import { Router } from 'express';
import {
  getTiposMuestra,
  getTipoMuestraById,
  createTipoMuestra,
  updateTipoMuestra,
  deleteTipoMuestra,
} from '../controllers/dimTipoMuestra.controller';

const router = Router();

router.get('/', getTiposMuestra);
router.get('/:id', getTipoMuestraById);
router.post('/', createTipoMuestra);
router.put('/:id', updateTipoMuestra);
router.delete('/:id', deleteTipoMuestra);

export { router as dimTipoMuestraRoutes };
