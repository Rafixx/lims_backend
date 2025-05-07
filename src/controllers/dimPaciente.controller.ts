// src/controllers/dimPaciente.controller.ts
import { Request, Response } from 'express';
import { DimPacienteService } from '../services/dimPaciente.service';

const service = new DimPacienteService();

export const getPacientes = async (_: Request, res: Response) => {
  const data = await service.getAll();
  res.json(data);
};

export const getPacienteById = async (req: Request, res: Response) => {
  const data = await service.getById(Number(req.params.id));
  res.json(data);
};

export const createPaciente = async (req: Request, res: Response) => {
  const nuevo = await service.create(req.body);
  res.status(201).json(nuevo);
};

export const updatePaciente = async (req: Request, res: Response) => {
  const actualizado = await service.update(Number(req.params.id), req.body);
  res.json(actualizado);
};

export const deletePaciente = async (req: Request, res: Response) => {
  await service.delete(Number(req.params.id));
  res.status(204).send();
};
