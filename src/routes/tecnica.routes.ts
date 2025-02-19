// src/routes/tecnica.routes.ts
import { Router } from 'express';
import {
  getTecnicas,
  getTecnicaById,
  createTecnica,
  updateTecnica,
  deleteTecnica,
} from '../controllers/tecnica.controller';

const tecnicaRoutes = Router();

tecnicaRoutes.get('/', getTecnicas);
tecnicaRoutes.get('/:id', getTecnicaById);
tecnicaRoutes.post('/', createTecnica);
tecnicaRoutes.put('/:id', updateTecnica);
tecnicaRoutes.delete('/:id', deleteTecnica);

export default tecnicaRoutes;
