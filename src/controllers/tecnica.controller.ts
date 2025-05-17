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

export const getTecnicasBySolicitudId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const tecnicas = await tecnicaService.getTecnicaBySolicitudId(id);
    res.status(200).json(tecnicas);
  } catch (error) {
    next(error);
  }
};

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
