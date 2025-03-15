// src/routes/solicitudes.routes.ts
import { Router } from 'express';
import {
  createSolicitud,
  deleteSolicitud,
  getSolicitudById,
  getSolicitudes,
  updateSolicitud,
} from '../controllers/solicitudes.controller';

const solicitudRoutes = Router();

solicitudRoutes.get('/', getSolicitudes);
solicitudRoutes.get('/:id', getSolicitudById);
solicitudRoutes.post('/', createSolicitud);
solicitudRoutes.put('/:id', updateSolicitud);
solicitudRoutes.delete('/:id', deleteSolicitud);

export default solicitudRoutes;
