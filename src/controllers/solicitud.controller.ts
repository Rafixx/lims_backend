import { Request, Response, NextFunction } from 'express';
import { SolicitudService } from '../services/solicitud.service';

const solicitudService = new SolicitudService();

export const getSolicitudes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const solicitudes = await solicitudService.getAllSolicitudes();
    res.status(200).json(solicitudes);
  } catch (error) {
    next(error);
  }
};

export const getSolicitudById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const solicitud = await solicitudService.getSolicitudById(id);
    res.status(200).json(solicitud);
  } catch (error) {
    next(error);
  }
};

// export const getTecnicasBySolicitud = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const id = Number(req.params.id);
//   try {
//     const tecnicas = await solicitudService.getTecnicasBySolicitud(id);
//     res.status(200).json(tecnicas);
//   } catch (error) {
//     next(error);
//   }
// }

export const createSolicitud = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nuevaSolicitud = await solicitudService.createSolicitud(req.body);
    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    next(error);
  }
};

export const updateSolicitud = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const solicitudActualizada = await solicitudService.updateSolicitud(
      id,
      req.body
    );
    res.status(200).json(solicitudActualizada);
  } catch (error) {
    next(error);
  }
};

export const deleteSolicitud = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const result = await solicitudService.deleteSolicitud(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
