// src/controllers/tecnica.controller.ts
import { Request, Response } from 'express';
import { tecnicas } from '../data/tecnicas';
import { Tecnica } from '../data/tipos';

// Obtener todas las técnicas
export const getTecnicas = (req: Request, res: Response): void => {
  res.json(tecnicas);
};

// Obtener una técnica por id
export const getTecnicaById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const tecnica = tecnicas.find((t) => t.id === id);
  if (!tecnica) {
    res.status(404).json({ message: 'Técnica no encontrada' });
    return;
  }
  res.json(tecnica);
};

// Crear una nueva técnica
export const createTecnica = (req: Request, res: Response): void => {
  // Se espera que el body contenga "nombre", "productoId", "maquinaId" (opcional) y "parametros"
  const newTecnica: Tecnica = {
    id: `tec${tecnicas.length + 1}`,
    ...req.body,
  };
  tecnicas.push(newTecnica);
  res.status(201).json(newTecnica);
};

// Actualizar una técnica existente
export const updateTecnica = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = tecnicas.findIndex((t) => t.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Técnica no encontrada' });
    return;
  }
  const updatedTecnica = {
    ...tecnicas[index],
    ...req.body,
  };
  tecnicas[index] = updatedTecnica;
  res.json(updatedTecnica);
};

// Eliminar una técnica
export const deleteTecnica = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = tecnicas.findIndex((t) => t.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Técnica no encontrada' });
    return;
  }
  tecnicas.splice(index, 1);
  res.status(204).send();
};
