// src/routes/aparato.routes.ts
import { Router } from 'express';
import {
  getAparatos,
  getAparatoById,
  createAparato,
  updateAparato,
  deleteAparato,
} from '../controllers/aparato.controller';

const aparatoRoutes = Router();

// Endpoints para la entidad "aparato"
aparatoRoutes.get('/', getAparatos);
aparatoRoutes.get('/:id', getAparatoById);
aparatoRoutes.post('/', createAparato);
aparatoRoutes.put('/:id', updateAparato);
aparatoRoutes.delete('/:id', deleteAparato);

export default aparatoRoutes;
