// src/controllers/aparato.controller.ts
import { Request, Response } from 'express';
import { aparatos } from '../data/aparatos';
import { Aparato } from '../data/tipos';

// Obtener todas las máquinas
export const getAparatos = (req: Request, res: Response): void => {
  res.json(aparatos);
};

// Obtener una máquina por su id
export const getAparatoById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const aparato = aparatos.find((m) => m.id === id);
  if (!aparato) {
    res.status(404).json({ message: 'Aparato no encontrada' });
    return;
  }
  res.json(aparato);
};

// Crear una nueva máquina
export const createAparato = (req: Request, res: Response): void => {
  // Se espera que el body contenga "nombre" y "tipo"
  const newAparato: Aparato = {
    id: `maq${aparatos.length + 1}`,
    ...req.body,
  };
  aparatos.push(newAparato);
  res.status(201).json(newAparato);
};

// Actualizar una máquina existente
export const updateAparato = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = aparatos.findIndex((m) => m.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Aparato no encontrada' });
    return;
  }
  const updatedAparato = {
    ...aparatos[index],
    ...req.body,
  };
  aparatos[index] = updatedAparato;
  res.json(updatedAparato);
};

// Eliminar una máquina
export const deleteAparato = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = aparatos.findIndex((m) => m.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Aparato no encontrada' });
    return;
  }
  aparatos.splice(index, 1);
  res.status(204).send();
};
