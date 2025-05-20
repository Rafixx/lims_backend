// src/controllers/dimMaquinas.controller.ts
import { Request, Response, NextFunction } from 'express';
import { DimMaquinaService } from '../services/dimMaquina.service';

const dimMaquinaService = new DimMaquinaService();

export const getDimMaquinas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const maquinas = await dimMaquinaService.getAllDimMaquinas();
    res.status(200).json(maquinas);
  } catch (error) {
    next(error);
  }
};

export const getDimMaquinaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const maquina = await dimMaquinaService.getDimMaquinaById(id);
    res.status(200).json(maquina);
  } catch (error) {
    next(error);
  }
};

export const createDimMaquina = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newMaquina = await dimMaquinaService.createDimMaquina(req.body);
    res.status(201).json(newMaquina);
  } catch (error) {
    next(error);
  }
};

export const updateDimMaquina = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const updated = await dimMaquinaService.updateDimMaquina(id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDimMaquina = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    await dimMaquinaService.deleteDimMaquina(id);
    res.status(200).json({ message: 'Máquina eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};
