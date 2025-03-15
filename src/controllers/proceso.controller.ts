// src/controllers/tecnica.controller.ts
import { Request, Response } from 'express';
import { procesos } from '../data/procesos';
import { Proceso } from '../data/tipos';

// Obtener todas las técnicas
export const getProcesos = (req: Request, res: Response): void => {
  res.json(procesos);
};

// Obtener una técnica por id
export const getProcesoById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const tecnica = procesos.find((t) => t.id === id);
  if (!tecnica) {
    res.status(404).json({ message: 'Técnica no encontrada' });
    return;
  }
  res.json(tecnica);
};

// Crear una nueva técnica
export const createProceso = (req: Request, res: Response): void => {
  // Se espera que el body contenga "nombre", "productoId", "maquinaId" (opcional) y "parametros"
  const newProceso: Proceso = {
    id: `tec${procesos.length + 1}`,
    ...req.body,
  };
  procesos.push(newProceso);
  res.status(201).json(newProceso);
};

// Actualizar una técnica existente
export const updateProceso = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = procesos.findIndex((t) => t.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Técnica no encontrada' });
    return;
  }
  const updatedProceso = {
    ...procesos[index],
    ...req.body,
  };
  procesos[index] = updatedProceso;
  res.json(updatedProceso);
};

// Eliminar una técnica
export const deleteProceso = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = procesos.findIndex((t) => t.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Técnica no encontrada' });
    return;
  }
  procesos.splice(index, 1);
  res.status(204).send();
};
