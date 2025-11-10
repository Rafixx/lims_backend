//src/routes/dimReactivo.routes.ts
import { Router } from 'express';
import {
  getDimReactivos,
  getDimReactivoById,
  getDimReactivoByIdTecnicaProc,
  createDimReactivo,
  updateDimReactivo,
  deleteDimReactivo,
} from '../controllers/dimReactivo.controller';

const router = Router();

router.get('/', getDimReactivos);
router.get('/:id', getDimReactivoById);
router.get('/tecnicaProc/:idTecnicaProc', getDimReactivoByIdTecnicaProc);
router.post('/', createDimReactivo);
router.put('/:id', updateDimReactivo);
router.delete('/:id', deleteDimReactivo);

export { router as dimReactivoRoutes };
