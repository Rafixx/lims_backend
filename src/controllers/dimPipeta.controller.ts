// src/controllers/dimPipetas.controller.ts
import { Request, Response, NextFunction } from 'express';
import { DimPipetaService } from '../services/dimPipeta.service';

const dimPipetasService = new DimPipetaService();

export const getDimPipetas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pipetas = await dimPipetasService.getAllDimPipetas();
    res.status(200).json(pipetas);
  } catch (error) {
    next(error);
  }
};

export const getDimPipetaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const pipeta = await dimPipetasService.getDimPipetaById(id);
    res.status(200).json(pipeta);
  } catch (error) {
    next(error);
  }
};

export const createDimPipeta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newPipeta = await dimPipetasService.createDimPipeta(req.body);
    res.status(201).json(newPipeta);
  } catch (error) {
    next(error);
  }
};

export const updateDimPipeta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const updated = await dimPipetasService.updateDimPipeta(id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDimPipeta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    await dimPipetasService.deleteDimPipeta(id);
    res.status(200).json({ message: 'Pipeta eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};
