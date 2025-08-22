//src/models/DimCentro.ts
import { Router } from 'express';
import {
  getDimCentros,
  getDimCentroById,
  createDimCentro,
  updateDimCentro,
  deleteDimCentro,
} from '../controllers/dimCentro.controller';

const router = Router();

router.get('/', getDimCentros);
router.get('/:id', getDimCentroById);
router.post('/', createDimCentro);
router.put('/:id', updateDimCentro);
router.delete('/:id', deleteDimCentro);

export { router as dimCentroRoutes };
