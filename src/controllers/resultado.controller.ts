import { Request, Response, NextFunction } from 'express';
import { ResultadoService } from '../services/resultado.service';
import { BadRequestError } from '../errors/BadRequestError';
import { ResultadoNanodropService } from '../services/resultadoNanodrop.service';
import { ResultadoQubitService } from '../services/resultadoQubit.service';

const resultadoService = new ResultadoService();
const resultadoNanodropService = new ResultadoNanodropService();
const resultadoQubitService = new ResultadoQubitService();

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

/**
 * Obtener todos los resultados
 */
export const getResultados = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const resultados = await resultadoService.getAllResultados();
    res.status(200).json(resultados);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un resultado por ID
 */
export const getResultadoById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = validateId(req.params.id);
    const resultado = await resultadoService.getResultadoById(id);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todos los resultados de una muestra
 */
export const getResultadosByMuestra = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id_muestra = validateId(req.params.id_muestra);
    const resultados =
      await resultadoService.getResultadosByMuestra(id_muestra);
    res.status(200).json(resultados);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todos los resultados de una técnica
 */
export const getResultadosByTecnica = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id_tecnica = validateId(req.params.id_tecnica);
    const resultados =
      await resultadoService.getResultadosByTecnica(id_tecnica);
    res.status(200).json(resultados);
  } catch (error) {
    next(error);
  }
};

/**
 * Crear un nuevo resultado
 */
export const createResultado = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nuevoResultado = await resultadoService.createResultado(req.body);
    res.status(201).json(nuevoResultado);
  } catch (error) {
    next(error);
  }
};

/**
 * Crear múltiples resultados en batch
 */
export const createResultadosBatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { resultados } = req.body;

    if (!Array.isArray(resultados)) {
      throw new BadRequestError(
        'El cuerpo de la petición debe contener un array "resultados"'
      );
    }

    const nuevosResultados =
      await resultadoService.createResultadosBatch(resultados);
    res.status(201).json(nuevosResultados);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar un resultado existente
 */
export const updateResultado = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = validateId(req.params.id);
    const resultadoActualizado = await resultadoService.updateResultado(
      id,
      req.body
    );
    res.status(200).json(resultadoActualizado);
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un resultado (soft delete)
 */
export const deleteResultado = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = validateId(req.params.id);
    const updated_by = req.body.updated_by; // Opcional: ID del usuario que elimina

    await resultadoService.deleteResultado(id, updated_by);
    res.status(200).json({
      success: true,
      message: `Resultado con ID ${id} eliminado correctamente`,
    });
  } catch (error) {
    next(error);
  }
};

export const getRawNanodropResultados = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawResultados = await resultadoNanodropService.findAllRaw();
    res.status(200).json(rawResultados);
  } catch (error) {
    next(error);
  }
};

export const getRawQubitResultados = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawResultados = await resultadoQubitService.findAllRaw();
    res.status(200).json(rawResultados);
  } catch (error) {
    next(error);
  }
};

/**
 * Importa datos de resultados para un worklist desde un archivo CSV
 */
export const setCSVtoRAW = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const idWorklist = validateId(req.params.id);

    // Verificar que se haya subido un archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningún archivo CSV',
      });
    }

    // Procesar el archivo CSV
    const resultado = await resultadoService.setCSVtoRAW(
      // idWorklist,
      req.file.buffer
    );

    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

/**
 * Procesa datos RAW con mapeo de worklist
 * POST /api/resultados/processWithMapping
 * Body: { id_worklist, mapeo: { sample_code: codigo_epi }, tipo: 'NANODROP' | 'QUBIT' }
 */
export const processWithMapping = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id_worklist, mapeo, tipo } = req.body;

    // Validaciones
    if (!id_worklist || id_worklist <= 0) {
      throw new BadRequestError('id_worklist es requerido y debe ser positivo');
    }

    if (!mapeo || typeof mapeo !== 'object') {
      throw new BadRequestError('mapeo es requerido y debe ser un objeto');
    }

    if (!tipo || !['NANODROP', 'QUBIT'].includes(tipo)) {
      throw new BadRequestError('tipo debe ser "NANODROP" o "QUBIT"');
    }

    // Ejecutar procesamiento según el tipo
    let resultado;
    if (tipo === 'NANODROP') {
      resultado = await resultadoNanodropService.processWithMapping(
        id_worklist,
        mapeo,
        0 // TODO: Obtener ID del usuario autenticado
      );
    } else {
      resultado = await resultadoQubitService.processWithMapping(
        id_worklist,
        mapeo,
        0 // TODO: Obtener ID del usuario autenticado
      );
    }

    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};
