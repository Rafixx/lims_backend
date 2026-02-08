//src/routes/dimTecnicaProc.routes.ts
import { Router } from 'express';
import {
  getTecnicasProc,
  getTecnicaProcById,
  createTecnicaProc,
  updateTecnicaProc,
  deleteTecnicaProc,
  batchUpdateOrden,
} from '../controllers/dimTecnicaProc.controller';

const router = Router();

router.get('/', getTecnicasProc);
router.patch('/orden', batchUpdateOrden);
router.get('/:id', getTecnicaProcById);
router.post('/', createTecnicaProc);
router.put('/:id', updateTecnicaProc);
router.delete('/:id', deleteTecnicaProc);

export { router as dimTecnicaProcRoutes };
