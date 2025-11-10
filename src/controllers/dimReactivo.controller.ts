// src/controllers/dimReactivos.controller.ts
import { Request, Response, NextFunction } from 'express';
import { DimReactivoService } from '../services/dimReactivo.service';

const dimReactivoService = new DimReactivoService();

export const getDimReactivos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reactivos = await dimReactivoService.getAllDimReactivos();
    res.status(200).json(reactivos);
  } catch (error) {
    next(error);
  }
};

export const getDimReactivoById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const reactivo = await dimReactivoService.getDimReactivoById(id);
    res.status(200).json(reactivo);
  } catch (error) {
    next(error);
  }
};

export const getDimReactivoByIdTecnicaProc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idTecnicaProc = Number(req.params.idTecnicaProc);
  try {
    const reactivos =
      await dimReactivoService.getDimReactivoByIdTecnicaProc(idTecnicaProc);
    res.status(200).json(reactivos);
  } catch (error) {
    next(error);
  }
};

export const createDimReactivo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newReactivo = await dimReactivoService.createDimReactivo(req.body);
    res.status(201).json(newReactivo);
  } catch (error) {
    next(error);
  }
};

export const updateDimReactivo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const updated = await dimReactivoService.updateDimReactivo(id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDimReactivo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    await dimReactivoService.deleteDimReactivo(id);
    res.status(200).json({ message: 'Reactivo eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
