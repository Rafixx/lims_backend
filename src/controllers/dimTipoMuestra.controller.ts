// src/controllers/dimTipoMuestra.controller.ts
import { Request, Response } from 'express';
import { DimTipoMuestraService } from '../services/dimTipoMuestra.service';

const service = new DimTipoMuestraService();

export const getTiposMuestra = async (_: Request, res: Response) => {
  const tipos = await service.getAll();
  res.json(tipos);
};

export const getTipoMuestraById = async (req: Request, res: Response) => {
  const tipo = await service.getById(Number(req.params.id));
  res.json(tipo);
};

export const createTipoMuestra = async (req: Request, res: Response) => {
  const tipo = await service.create(req.body);
  res.status(201).json(tipo);
};

export const updateTipoMuestra = async (req: Request, res: Response) => {
  const tipo = await service.update(Number(req.params.id), req.body);
  res.json(tipo);
};

export const deleteTipoMuestra = async (req: Request, res: Response) => {
  await service.delete(Number(req.params.id));
  res.status(204).send();
};
