//src/routes/dimPlantillaTecnica.routes.ts
import { Router } from 'express';
import {
  getPlantillasTecnicas,
  getPlantillaTecnicaById,
  createPlantillaTecnica,
  updatePlantillaTecnica,
  deletePlantillaTecnica,
} from '../controllers/dimPlantillaTecnica.controller';

const router = Router();

router.get('/', getPlantillasTecnicas);
router.get('/:id', getPlantillaTecnicaById);
router.post('/', createPlantillaTecnica);
router.put('/:id', updatePlantillaTecnica);
router.delete('/:id', deletePlantillaTecnica);

export { router as dimPlantillaTecnicaRoutes };
