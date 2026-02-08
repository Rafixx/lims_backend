import { Request, Response, NextFunction } from 'express';
import { DimTecnicaProcService } from '../services/dimTecnicaProc.service';

const dimTecnicaProcService = new DimTecnicaProcService();

export const getTecnicasProc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tecnicasProc = await dimTecnicaProcService.getAllTecnicasProc();
    res.status(200).json(tecnicasProc);
  } catch (error) {
    next(error);
  }
};

export const getTecnicaProcById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const tecnicaProc = await dimTecnicaProcService.getTecnicaProcById(id);
    res.status(200).json(tecnicaProc);
  } catch (error) {
    next(error);
  }
};

export const createTecnicaProc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nuevaTecnicaProc = await dimTecnicaProcService.createTecnicaProc(
      req.body
    );
    res.status(201).json(nuevaTecnicaProc);
  } catch (error) {
    next(error);
  }
};

export const updateTecnicaProc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const tecnicaProcActualizada =
      await dimTecnicaProcService.updateTecnicaProc(id, req.body);
    res.status(200).json(tecnicaProcActualizada);
  } catch (error) {
    next(error);
  }
};

export const batchUpdateOrden = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const items: { id: number; orden: number }[] = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Se espera un array de { id, orden }' });
    }
    const result = await dimTecnicaProcService.batchUpdateOrden(items);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteTecnicaProc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const result = await dimTecnicaProcService.deleteTecnicaProc(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
