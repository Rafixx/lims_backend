// src/controllers/dimPlantillaPasos.controller.ts
import { Request, Response, NextFunction } from 'express';
import { DimPlantillaPasosService } from '../services/dimPlantillaPasos.service';

const service = new DimPlantillaPasosService();

export const getAllDimPlantillaPasos = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pasos = await service.getAllDimPlantillaPasos();
    res.json(pasos);
  } catch (error) {
    next(error);
  }
};

export const getDimPlantillaPasosById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const paso = await service.getDimPlantillaPasosById(Number(req.params.id));
    res.json(paso);
  } catch (error) {
    next(error);
  }
};

export const createDimPlantillaPasos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const paso = await service.createDimPlantillaPasos(req.body);
    res.status(201).json(paso);
  } catch (error) {
    next(error);
  }
};

export const updateDimPlantillaPasos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const paso = await service.updateDimPlantillaPasos(
      Number(req.params.id),
      req.body
    );
    res.json(paso);
  } catch (error) {
    next(error);
  }
};

export const deleteDimPlantillaPasos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await service.deleteDimPlantillaPasos(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
