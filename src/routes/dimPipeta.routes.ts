//src/routes/dimPipeta.routes.ts
import { Router } from 'express';
import {
  getDimPipetas,
  getDimPipetaById,
  createDimPipeta,
  updateDimPipeta,
  deleteDimPipeta,
} from '../controllers/dimPipeta.controller';

const router = Router();

router.get('/', getDimPipetas);
router.get('/:id', getDimPipetaById);
router.post('/', createDimPipeta);
router.put('/:id', updateDimPipeta);
router.delete('/:id', deleteDimPipeta);

export { router as dimPipetaRoutes };
