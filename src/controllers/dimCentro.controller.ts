//src/controllers/dimCentro.controller.ts
import { Request, Response, NextFunction } from 'express';
import { DimCentroService } from '../services/dimCentro.service';

const dimCentroService = new DimCentroService();

export const getDimCentros = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const centros = await dimCentroService.getAllDimCentros();
    res.status(200).json(centros);
  } catch (error) {
    next(error);
  }
};

export const getDimCentroById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const centro = await dimCentroService.getDimCentroById(id);
    res.status(200).json(centro);
  } catch (error) {
    next(error);
  }
};

export const createDimCentro = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newCentro = await dimCentroService.createDimCentro(req.body);
    res.status(201).json(newCentro);
  } catch (error) {
    next(error);
  }
};

export const updateDimCentro = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const updated = await dimCentroService.updateDimCentro(id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDimCentro = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    await dimCentroService.deleteDimCentro(id);
    res.status(200).json({ message: 'Centro eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
