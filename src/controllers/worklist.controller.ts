import { Request, Response, NextFunction } from 'express';
import { WorklistService } from '../services/worklist.service';
import { BadRequestError } from '../errors/BadRequestError';

const worklistService = new WorklistService();

/**
 * Valida que un ID sea un número válido
 */
const validateId = (id: string): number => {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || parsedId <= 0) {
    throw new BadRequestError(
      `ID inválido: "${id}". Debe ser un número positivo.`
    );
  }
  return parsedId;
};

export const getWorklists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const worklists = await worklistService.getAllWorklists();
    res.status(200).json(worklists);
  } catch (error) {
    next(error);
  }
};

export const getWorklistById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = validateId(req.params.id);
    const worklist = await worklistService.getWorklistById(id);
    res.status(200).json(worklist);
  } catch (error) {
    next(error);
  }
};

export const getTecnicasById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = validateId(req.params.id);
    const worklist = await worklistService.getTecnicasById(id);
    res.status(200).json(worklist);
  } catch (error) {
    next(error);
  }
};

export const getPosiblesTecnicaProc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const posiblesTecnicasProc = await worklistService.getPosiblesTecnicaProc();
    res.status(200).json(posiblesTecnicasProc);
  } catch (error) {
    next(error);
  }
};

export const getPosiblesTecnicas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tecnicaProc = req.params.tecnicaProc as string;
  console.log('tecnicaProc', tecnicaProc);
  try {
    const posiblesTecnicas =
      await worklistService.getPosiblesTecnicas(tecnicaProc);
    res.status(200).json(posiblesTecnicas);
  } catch (error) {
    next(error);
  }
};

export const createWorklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nuevaWorklist = await worklistService.createWorklist(req.body);
    res.status(201).json(nuevaWorklist);
  } catch (error) {
    next(error);
  }
};

export const updateWorklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = validateId(req.params.id);
    const worklistActualizada = await worklistService.updateWorklist(
      id,
      req.body
    );
    res.status(200).json(worklistActualizada);
  } catch (error) {
    next(error);
  }
};

export const deleteWorklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = validateId(req.params.id);
    const resultado = await worklistService.deleteWorklist(id);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

export const setTecnicoLab = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const idWorklist = validateId(req.params.id);
    const { id_tecnico } = req.body;

    if (!id_tecnico) {
      throw new BadRequestError(
        'El id_tecnico es requerido en el cuerpo de la petición'
      );
    }

    const idTecnico = validateId(String(id_tecnico));

    const resultado = await worklistService.setTecnicoLab(
      idWorklist,
      idTecnico
    );
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

/**
 * Importa datos de resultados para un worklist desde un archivo CSV
 * Procesa RAW → FINAL → RESULTADO usando mapeo de filas
 * POST /api/worklists/:id/importDataResults
 * Body: { mapping: Record<number, number>, type: 'NANODROP' | 'QUBIT' }
 */
export const importDataResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const idWorklist = validateId(req.params.id);
    const { mapping, type } = req.body;

    // Log para debugging
    console.log(
      '📥 [importDataResults] Request body:',
      JSON.stringify(req.body, null, 2)
    );
    console.log('📥 [importDataResults] mapping type:', typeof mapping);
    console.log('📥 [importDataResults] type:', type);

    // Validaciones
    if (!mapping || typeof mapping !== 'object') {
      console.error('❌ [importDataResults] Validación mapping falló:', {
        mapping,
        type: typeof mapping,
      });
      return res.status(400).json({
        success: false,
        message: 'Se requiere el campo "mapping" como objeto',
      });
    }

    if (!type || !['NANODROP', 'QUBIT'].includes(type)) {
      console.error('❌ [importDataResults] Validación type falló:', { type });
      return res.status(400).json({
        success: false,
        message: 'El campo "type" debe ser "NANODROP" o "QUBIT"',
      });
    }

    // Procesar con mapeo
    const resultado = await worklistService.importDataResults(
      idWorklist,
      mapping,
      type
    );

    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

export const startTecnicasInWorklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const idWorklist = validateId(req.params.id);
    const resultado = await worklistService.startTecnicasInWorklist(idWorklist);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};
