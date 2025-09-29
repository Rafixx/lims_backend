import { Router } from 'express';
import {
  getTecnicasById,
  getWorklists,
  getWorklistById,
  getPosiblesTecnicaProc,
  createWorklist,
  deleteWorklist,
  updateWorklist,
  getPosiblesTecnicas,
  setTecnicoLab,
} from '../controllers/worklist.controller';

const router = Router();

router.get('/', getWorklists);
router.get('/posiblesTecnicasProc', getPosiblesTecnicaProc);
router.get('/posiblesTecnicas/:tecnicaProc', getPosiblesTecnicas);
router.get('/:id', getWorklistById);
router.get('/:id/tecnicas', getTecnicasById);
router.post('/', createWorklist);
router.delete('/:id', deleteWorklist);
router.put('/:id', updateWorklist);
router.put('/:id/setTecnicoLab', setTecnicoLab);

export { router as worklistRouter };
