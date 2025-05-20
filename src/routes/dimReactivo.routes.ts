//src/routes/dimReactivo.routes.ts
import { Router } from 'express';
import {
  getDimReactivos,
  getDimReactivoById,
  createDimReactivo,
  updateDimReactivo,
  deleteDimReactivo,
} from '../controllers/dimReactivo.controller';

const router = Router();

router.get('/', getDimReactivos);
router.get('/:id', getDimReactivoById);
router.post('/', createDimReactivo);
router.put('/:id', updateDimReactivo);
router.delete('/:id', deleteDimReactivo);

export { router as dimReactivoRoutes };
