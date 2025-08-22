//src/routes/tecnicoLab.routes.ts
import { Router } from 'express';
import { getAllTecnicoLab } from '../controllers/tecnicoLab.controller';

const router = Router();

router.get('/', getAllTecnicoLab);

export { router as tecnicoLabRoutes };
