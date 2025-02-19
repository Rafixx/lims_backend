// src/controllers/maquina.controller.ts
import { Request, Response } from 'express';
import { maquinas } from '../data/maquinas';
import { Maquina } from '../data/tipos';

// Obtener todas las máquinas
export const getMaquinas = (req: Request, res: Response): void => {
  res.json(maquinas);
};

// Obtener una máquina por su id
export const getMaquinaById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const maquina = maquinas.find((m) => m.id === id);
  if (!maquina) {
    res.status(404).json({ message: 'Maquina no encontrada' });
    return;
  }
  res.json(maquina);
};

// Crear una nueva máquina
export const createMaquina = (req: Request, res: Response): void => {
  // Se espera que el body contenga "nombre" y "tipo"
  const newMaquina: Maquina = {
    id: `maq${maquinas.length + 1}`,
    ...req.body,
  };
  maquinas.push(newMaquina);
  res.status(201).json(newMaquina);
};

// Actualizar una máquina existente
export const updateMaquina = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = maquinas.findIndex((m) => m.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Maquina no encontrada' });
    return;
  }
  const updatedMaquina = {
    ...maquinas[index],
    ...req.body,
  };
  maquinas[index] = updatedMaquina;
  res.json(updatedMaquina);
};

// Eliminar una máquina
export const deleteMaquina = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = maquinas.findIndex((m) => m.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Maquina no encontrada' });
    return;
  }
  maquinas.splice(index, 1);
  res.status(204).send();
};
