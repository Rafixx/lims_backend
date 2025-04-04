//src/routes/pipetas.routes.ts
import { Router } from 'express';
import { getPipetas, getPipetaById } from '../controllers/pipeta.controller';

const pipetaRoutes = Router();
pipetaRoutes.get('/', getPipetas);
pipetaRoutes.get('/:id', getPipetaById);

export default pipetaRoutes;
