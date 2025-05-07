// src/controllers/dimUbicacion.controller.ts
import { Request, Response } from 'express';
import { DimUbicacionService } from '../services/dimUbicacion.service';

const service = new DimUbicacionService();

export const getUbicaciones = async (_: Request, res: Response) => {
  const data = await service.getAll();
  res.json(data);
};

export const getUbicacionById = async (req: Request, res: Response) => {
  const data = await service.getById(Number(req.params.id));
  res.json(data);
};

export const createUbicacion = async (req: Request, res: Response) => {
  const nueva = await service.create(req.body);
  res.status(201).json(nueva);
};

export const updateUbicacion = async (req: Request, res: Response) => {
  const actualizada = await service.update(Number(req.params.id), req.body);
  res.json(actualizada);
};

export const deleteUbicacion = async (req: Request, res: Response) => {
  await service.delete(Number(req.params.id));
  res.status(204).send();
};
