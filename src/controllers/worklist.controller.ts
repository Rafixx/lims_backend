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
 */
export const importDataResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const idWorklist = validateId(req.params.id);

    // Verificar que se haya subido un archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningún archivo CSV',
      });
    }

    // Procesar el archivo CSV
    const resultado = await worklistService.importDataResults(
      idWorklist,
      req.file.buffer
    );

    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

/**
 * Importa datos de resultados de Qubit para un worklist desde un archivo CSV
 */
export const importQubitDataResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const idWorklist = validateId(req.params.id);

    // Verificar que se haya subido un archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningún archivo CSV de Qubit',
      });
    }

    // Procesar el archivo CSV de Qubit
    const resultado = await worklistService.importQubitDataResults(
      idWorklist,
      req.file.buffer
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
