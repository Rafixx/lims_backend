import { Request, Response, NextFunction } from 'express';
import { DimPruebaService } from '../services/dimPrueba.service';

const dimPruebaService = new DimPruebaService();

export const getPruebas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pruebas = await dimPruebaService.getAllPruebas();
    res.status(200).json(pruebas);
  } catch (error) {
    next(error);
  }
};

export const getPruebaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const prueba = await dimPruebaService.getPruebaById(id);
    res.status(200).json(prueba);
  } catch (error) {
    next(error);
  }
};

export const getTecnicasByPrueba = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const tecnicas = await dimPruebaService.getTecnicasByPrueba(id);
    res.status(200).json(tecnicas);
  } catch (error) {
    next(error);
  }
};

export const createPrueba = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nuevaPrueba = await dimPruebaService.createPrueba(req.body);
    res.status(201).json(nuevaPrueba);
  } catch (error) {
    next(error);
  }
};

export const updatePrueba = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const pruebaActualizada = await dimPruebaService.updatePrueba(id, req.body);
    res.status(200).json(pruebaActualizada);
  } catch (error) {
    next(error);
  }
};

export const deletePrueba = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const result = await dimPruebaService.deletePrueba(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
