import { Router } from 'express';
import {
  getTecnicasById,
  getWorklists,
  getWorklistById,
  createWorklist,
  deleteWorklist,
  updateWorklist,
} from '../controllers/worklist.controller';

const router = Router();

router.get('/', getWorklists);
router.get('/:id', getWorklistById);
router.post('/', createWorklist);
router.delete('/:id', deleteWorklist);
router.put('/:id', updateWorklist);
router.get('/:id/tecnicas', getTecnicasById);

export { router as worklistRouter };
