import { Request, Response, NextFunction } from 'express';
import { MuestraService } from '../services/muestra.service';

const muestraService = new MuestraService();

export const getMuestras = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const muestras = await muestraService.getAllMuestras();
    res.status(200).json(muestras);
  } catch (error) {
    next(error);
  }
};

export const getMuestraById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const muestra = await muestraService.getMuestraById(id);
    res.status(200).json(muestra);
  } catch (error) {
    next(error);
  }
};

export const createMuestra = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nuevaMuestra = await muestraService.createMuestra(req.body);
    res.status(201).json(nuevaMuestra);
  } catch (error) {
    next(error);
  }
};

export const updateMuestra = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const muestraActualizada = await muestraService.updateMuestra(id, req.body);
    res.status(200).json(muestraActualizada);
  } catch (error) {
    next(error);
  }
};

export const deleteMuestra = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const result = await muestraService.deleteMuestra(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
