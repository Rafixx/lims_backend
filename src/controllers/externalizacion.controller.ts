import { Request, Response, NextFunction } from 'express';
import { ExternalizacionService } from '../services/externalizacion.service';

const externalizacionService = new ExternalizacionService();

/**
 * GET /api/externalizaciones
 * Obtiene todas las externalizaciones
 */
export const getExternalizaciones = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const externalizaciones =
      await externalizacionService.getAllExternalizaciones();
    res.status(200).json({
      success: true,
      data: externalizaciones,
      message: 'Externalizaciones obtenidas correctamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/externalizaciones/:id
 * Obtiene una externalización por ID
 */
export const getExternalizacionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const externalizacion =
      await externalizacionService.getExternalizacionById(id);
    res.status(200).json({
      success: true,
      data: externalizacion,
      message: 'Externalización obtenida correctamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/externalizaciones/tecnica/:idTecnica
 * Obtiene externalizaciones por ID de técnica
 */
export const getExternalizacionesByTecnicaId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const idTecnica = Number(req.params.idTecnica);
    const externalizaciones =
      await externalizacionService.getExternalizacionesByTecnicaId(idTecnica);
    res.status(200).json({
      success: true,
      data: externalizaciones,
      message: 'Externalizaciones obtenidas correctamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/externalizaciones/centro/:idCentro
 * Obtiene externalizaciones por centro
 */
export const getExternalizacionesByCentro = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const idCentro = Number(req.params.idCentro);
    const externalizaciones =
      await externalizacionService.getExternalizacionesByCentro(idCentro);
    res.status(200).json({
      success: true,
      data: externalizaciones,
      message: 'Externalizaciones obtenidas correctamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/externalizaciones/pendientes
 * Obtiene externalizaciones pendientes (enviadas pero sin recepción)
 */
export const getExternalizacionesPendientes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const externalizaciones =
      await externalizacionService.getExternalizacionesPendientes();
    res.status(200).json({
      success: true,
      data: externalizaciones,
      message: 'Externalizaciones pendientes obtenidas correctamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/externalizaciones
 * Crea una nueva externalización
 */
export const createExternalizacion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const nuevaExternalizacion =
      await externalizacionService.createExternalizacion(req.body);
    res.status(201).json({
      success: true,
      data: nuevaExternalizacion,
      message: 'Externalización creada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/externalizaciones/:id
 * Actualiza una externalización
 */
export const updateExternalizacion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const externalizacionActualizada =
      await externalizacionService.updateExternalizacion(id, req.body);
    res.status(200).json({
      success: true,
      data: externalizacionActualizada,
      message: 'Externalización actualizada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/externalizaciones/:id
 * Elimina una externalización (soft delete)
 */
export const deleteExternalizacion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const result = await externalizacionService.deleteExternalizacion(id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/externalizaciones/enviar
 * Marca externalizaciones como enviadas y actualiza técnicas a estado ENVIADA_EXT
 */
export const marcarComoEnviadas = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await externalizacionService.marcarComoEnviadas(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/externalizaciones/:id/recepcion
 * Registra la recepción de una externalización y actualiza técnica a estado RECIBIDA_EXT
 */
export const registrarRecepcion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { f_recepcion, updated_by } = req.body;

    const externalizacion = await externalizacionService.registrarRecepcion(
      id,
      f_recepcion ? new Date(f_recepcion) : undefined,
      updated_by
    );

    res.status(200).json({
      success: true,
      data: externalizacion,
      message: 'Recepción registrada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/externalizaciones/:id/recepcion-datos
 * Registra la recepción de datos de una externalización
 */
export const registrarRecepcionDatos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { f_recepcion_datos, updated_by } = req.body;

    const externalizacion =
      await externalizacionService.registrarRecepcionDatos(
        id,
        f_recepcion_datos ? new Date(f_recepcion_datos) : undefined,
        updated_by
      );

    res.status(200).json({
      success: true,
      data: externalizacion,
      message: 'Recepción de datos registrada correctamente',
    });
  } catch (error) {
    next(error);
  }
};
