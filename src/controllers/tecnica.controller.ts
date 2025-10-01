import { Request, Response, NextFunction } from 'express';
import { TecnicaService } from '../services/tecnica.service';

const tecnicaService = new TecnicaService();

export const getTecnicas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tecnicas = await tecnicaService.getAllTecnicas();
    res.status(200).json(tecnicas);
  } catch (error) {
    next(error);
  }
};

export const getTecnicaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const tecnica = await tecnicaService.getTecnicaById(id);
    res.status(200).json(tecnica);
  } catch (error) {
    next(error);
  }
};

// export const getTecnicasBySolicitudId = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const id = Number(req.params.id);
//   try {
//     const tecnicas = await tecnicaService.getTecnicaBySolicitudId(id);
//     res.status(200).json(tecnicas);
//   } catch (error) {
//     next(error);
//   }
// };

export const getTecnicasByMuestraId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const tecnicas = await tecnicaService.getTecnicaByMuestraId(id);
    res.status(200).json(tecnicas);
  } catch (error) {
    next(error);
  }
};

export const createTecnica = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nuevaTecnica = await tecnicaService.createTecnica(req.body);
    res.status(201).json(nuevaTecnica);
  } catch (error) {
    next(error);
  }
};

export const updateTecnica = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const tecnicaActualizada = await tecnicaService.updateTecnica(id, req.body);
    res.status(200).json(tecnicaActualizada);
  } catch (error) {
    next(error);
  }
};

export const deleteTecnica = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const result = await tecnicaService.deleteTecnica(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Asigna un técnico responsable a una técnica
 * PATCH /api/tecnicas/:idTecnica/asignar
 */
export const asignarTecnico = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idTecnica } = req.params;
    const { id_tecnico_resp } = req.body;

    const id = parseInt(idTecnica, 10);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de técnica inválido',
      });
      return;
    }

    if (!id_tecnico_resp || isNaN(parseInt(id_tecnico_resp, 10))) {
      res.status(400).json({
        success: false,
        message: 'ID de técnico responsable inválido',
      });
      return;
    }

    const tecnica = await tecnicaService.asignarTecnico(
      id,
      parseInt(id_tecnico_resp, 10)
    );

    res.status(200).json({
      success: true,
      data: tecnica,
      message: 'Técnico asignado correctamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Inicia una técnica (cambia estado a EN_PROGRESO)
 * PATCH /api/tecnicas/:idTecnica/iniciar
 */
export const iniciarTecnica = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idTecnica } = req.params;
    const id = parseInt(idTecnica, 10);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de técnica inválido',
      });
      return;
    }

    const tecnica = await tecnicaService.iniciarTecnica(id);

    res.status(200).json({
      success: true,
      data: tecnica,
      message: 'Técnica iniciada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Completa una técnica (cambia estado a COMPLETADA)
 * PATCH /api/tecnicas/:idTecnica/completar
 */
export const completarTecnica = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idTecnica } = req.params;
    const { comentarios } = req.body;

    const id = parseInt(idTecnica, 10);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de técnica inválido',
      });
      return;
    }

    const tecnica = await tecnicaService.completarTecnica(id, comentarios);

    res.status(200).json({
      success: true,
      data: tecnica,
      message: 'Técnica completada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene técnicas pendientes para un proceso específico con información de muestra
 * GET /api/tecnicas/proceso/:idTecnicaProc/tecnicas
 */
export const getTecnicasPendientesPorProceso = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idTecnicaProc } = req.params;
    const id = parseInt(idTecnicaProc, 10);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de proceso de técnica inválido',
      });
      return;
    }

    const tecnicas = await tecnicaService.getTecnicasPendientesPorProceso(id);

    res.status(200).json({
      success: true,
      data: tecnicas,
      message: `Técnicas pendientes para proceso ${id} obtenidas correctamente`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene todas las técnicas con información de muestra
 * GET /api/tecnicas/con-muestra
 */
export const getTecnicasConMuestra = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tecnicas = await tecnicaService.getTecnicasConMuestra();

    res.status(200).json({
      success: true,
      data: tecnicas,
      message: 'Técnicas con información de muestra obtenidas correctamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene estadísticas del worklist calculadas en backend
 * GET /api/tecnicas/estadisticas
 */
export const getEstadisticasWorklist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await tecnicaService.getWorklistStatsCalculadas();

    res.status(200).json({
      success: true,
      data: stats,
      message: 'Estadísticas del worklist obtenidas correctamente',
    });
  } catch (error) {
    next(error);
  }
};

export const cambiarEstadoTecnica = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id_tecnica = Number(req.params.id);
  const { nuevoEstadoId, observaciones } = req.body;

  try {
    const { EstadoService } = await import('../services/estado.service');
    const estadoService = new EstadoService();

    const resultado = await estadoService.cambiarEstadoTecnica(
      id_tecnica,
      nuevoEstadoId,
      observaciones
    );

    res.status(200).json({
      success: true,
      message: 'Estado de técnica actualizado correctamente',
      data: resultado,
    });
  } catch (error) {
    next(error);
  }
};
