//src/routes/dimPrueba.routes.ts
import { Router } from 'express';
import {
  getPruebas,
  getPruebaById,
  getTecnicasByPrueba,
  createPrueba,
  updatePrueba,
  deletePrueba,
} from '../controllers/dimPrueba.controller';

const router = Router();

router.get('/', getPruebas);
router.get('/:id', getPruebaById);
router.get('/:id/tecnicas', getTecnicasByPrueba);
router.post('/', createPrueba);
router.put('/:id', updatePrueba);
router.delete('/:id', deletePrueba);

export { router as dimPruebaRoutes };
