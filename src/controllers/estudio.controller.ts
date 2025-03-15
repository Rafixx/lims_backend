// src/controllers/estudio.controller.ts
import { Request, Response } from 'express';
import { estudios } from '../data/estudios';
import { Estudio } from '../data/tipos';

// Obtener todos los estudios
export const getEstudios = (req: Request, res: Response): void => {
  res.json(estudios);
};

// Obtener un estudio por su id
export const getEstudioById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const estudio = estudios.find((p) => p.id === id);
  if (!estudio) {
    res.status(404).json({ message: 'Estudio no encontrado' });
    return;
  }
  res.json(estudio);
};

// Crear un nuevo estudio
export const createEstudio = (req: Request, res: Response): void => {
  // Se espera que el body contenga "nombre" y "tecnicas" (array de IDs de técnicas)
  const newEstudio: Estudio = {
    id: `prod${estudios.length + 1}`,
    ...req.body,
  };
  estudios.push(newEstudio);
  res.status(201).json(newEstudio);
};

// Actualizar un estudio existente
export const updateEstudio = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = estudios.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Estudio no encontrado' });
    return;
  }
  const updatedEstudio = {
    ...estudios[index],
    ...req.body,
  };
  estudios[index] = updatedEstudio;
  res.json(updatedEstudio);
};

// Eliminar un estudio
export const deleteEstudio = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = estudios.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Estudio no encontrado' });
    return;
  }
  estudios.splice(index, 1);
  res.status(204).send();
};
