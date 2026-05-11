// src/routes/muestra.routes.ts
import { Router } from 'express';
import {
  getMuestras,
  getMuestraById,
  getTecnicasById,
  createMuestra,
  updateMuestra,
  updateEstadoMuestra,
  deleteMuestra,
  getMuestrasStats,
  cambiarEstadoMuestra,
  getCodigoEpi,
  assignCodigosExternos,
  getArrayByMuestra,
  assignArrayCodigosExternos,
  bulkUpdateByEstudio,
} from '../controllers/muestra.controller';
import { crearRegistroMasivo } from '../controllers/registroMasivo.controller';

const router = Router();

router.get('/', getMuestras);
router.get('/estadisticas', getMuestrasStats);
router.get('/codigo-epi', getCodigoEpi);
router.post('/registro-masivo', crearRegistroMasivo);
router.post('/estudio/:estudio/cod-externo', assignCodigosExternos);
router.put('/estudio/:estudio/bulk', bulkUpdateByEstudio);
router.get('/:id', getMuestraById);
router.get('/:id/tecnicas', getTecnicasById);
router.get('/:id/array', getArrayByMuestra);
router.post('/:id/array/cod-externo', assignArrayCodigosExternos);
router.post('/', createMuestra);
router.put('/:id/estado', updateEstadoMuestra);
router.put('/:id', updateMuestra);
router.delete('/:id', deleteMuestra);
router.post('/:id/cambiar-estado', cambiarEstadoMuestra);

export { router as muestraRoutes };
