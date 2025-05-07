import { Router } from 'express';
import {
  getUbicaciones,
  getUbicacionById,
  createUbicacion,
  updateUbicacion,
  deleteUbicacion,
} from '../controllers/dimUbicacion.controller';

const router = Router();

router.get('/', getUbicaciones);
router.get('/:id', getUbicacionById);
router.post('/', createUbicacion);
router.put('/:id', updateUbicacion);
router.delete('/:id', deleteUbicacion);

export { router as dimUbicacionRoutes };
