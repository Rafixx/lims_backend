import { Request, Response, NextFunction } from 'express';
import { DimCriterioValidacionService } from '../services/dimCriterioValidacion.service';

const dimCriterioValidacionService = new DimCriterioValidacionService();

export const getDimCriterioValidaciones = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const criterios =
      await dimCriterioValidacionService.getAllDimCriteriosValidacion();
    res.status(200).json(criterios);
  } catch (error) {
    next(error);
  }
};

export const getDimCriterioValidacionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const criterio =
      await dimCriterioValidacionService.getDimCriterioValidacionById(id);
    res.status(200).json(criterio);
  } catch (error) {
    next(error);
  }
};

export const createDimCriterioValidacion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newCriterio =
      await dimCriterioValidacionService.createDimCriterioValidacion(req.body);
    res.status(201).json(newCriterio);
  } catch (error) {
    next(error);
  }
};

export const updateDimCriterioValidacion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const updated =
      await dimCriterioValidacionService.updateDimCriterioValidacion(
        id,
        req.body
      );
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDimCriterioValidacion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    await dimCriterioValidacionService.deleteDimCriterioValidacion(id);
    res
      .status(200)
      .json({ message: 'Criterio de validación eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
