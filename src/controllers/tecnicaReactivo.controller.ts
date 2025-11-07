// src/controllers/tecnicaReactivo.controller.ts
import { Request, Response, NextFunction } from 'express';
import { TecnicaReactivoService } from '../services/tecnicaReactivo.service';

const service = new TecnicaReactivoService();

export const getAllTecnicaReactivos = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tecnicasReactivos = await service.getAllTecnicaReactivos();
    res.json(tecnicasReactivos);
  } catch (error) {
    next(error);
  }
};

export const getTecnicaReactivoById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tecnicaReactivo = await service.getTecnicaReactivoById(
      Number(req.params.id)
    );
    res.json(tecnicaReactivo);
  } catch (error) {
    next(error);
  }
};

export const createTecnicaReactivo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tecnicaReactivo = await service.createTecnicaReactivo(req.body);
    res.status(201).json(tecnicaReactivo);
  } catch (error) {
    next(error);
  }
};

export const updateTecnicaReactivo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tecnicaReactivo = await service.updateTecnicaReactivo(
      Number(req.params.id),
      req.body
    );
    res.json(tecnicaReactivo);
  } catch (error) {
    next(error);
  }
};

export const deleteTecnicaReactivo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await service.deleteTecnicaReactivo(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
