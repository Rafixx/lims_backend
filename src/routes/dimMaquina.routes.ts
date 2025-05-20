//src/routes/dimMaquina.routes.ts
import { Router } from 'express';
import {
  getDimMaquinas,
  getDimMaquinaById,
  createDimMaquina,
  updateDimMaquina,
  deleteDimMaquina,
} from '../controllers/dimMaquina.controller';

const router = Router();

router.get('/', getDimMaquinas);
router.get('/:id', getDimMaquinaById);
router.post('/', createDimMaquina);
router.put('/:id', updateDimMaquina);
router.delete('/:id', deleteDimMaquina);

export { router as dimMaquinaRoutes };
