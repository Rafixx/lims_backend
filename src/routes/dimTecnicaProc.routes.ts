//src/routes/dimTecnicaProc.routes.ts
import { Router } from 'express';
import {
  getTecnicasProc,
  getTecnicaProcById,
  createTecnicaProc,
  updateTecnicaProc,
  deleteTecnicaProc,
} from '../controllers/dimTecnicaProc.controller';

const router = Router();

router.get('/', getTecnicasProc);
router.get('/:id', getTecnicaProcById);
router.post('/', createTecnicaProc);
router.put('/:id', updateTecnicaProc);
router.delete('/:id', deleteTecnicaProc);

export { router as dimTecnicaProcRoutes };
