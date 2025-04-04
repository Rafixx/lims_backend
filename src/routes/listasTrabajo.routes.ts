//src/routes/listasTrabajo.routes.ts
import { Router } from 'express';
import {
  getListasTrabajo,
  getListasTrabajoById,
} from '../controllers/listasTrabajo.controller';

const listasTrabajoRoutes = Router();

// Endpoints para la entidad "listas de trabajo"
listasTrabajoRoutes.get('/', getListasTrabajo);
listasTrabajoRoutes.get('/:id', getListasTrabajoById);

export default listasTrabajoRoutes;
