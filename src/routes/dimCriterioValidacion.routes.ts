import { Router } from 'express';
import {
  getDimCriterioValidaciones,
  getDimCriterioValidacionById,
  createDimCriterioValidacion,
  updateDimCriterioValidacion,
  deleteDimCriterioValidacion,
} from '../controllers/dimCriterioValidacion.controller';

const router = Router();

router.get('/', getDimCriterioValidaciones);
router.get('/:id', getDimCriterioValidacionById);
router.post('/', createDimCriterioValidacion);
router.put('/:id', updateDimCriterioValidacion);
router.delete('/:id', deleteDimCriterioValidacion);

export { router as dimCriterioValidacionRoutes };
