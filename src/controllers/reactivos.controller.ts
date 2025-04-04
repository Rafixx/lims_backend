//src/controllers/pipeta.controller.ts
import { Request, Response } from 'express';
// import { Pipeta } from '../data/tipos';
import { reactivos } from '../data/reactivos';

// Obtener todas las reactivos
export const getReactivos = (req: Request, res: Response): void => {
  res.json(reactivos);
};

// Obtener un reactivo por su id
export const getReactivoById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const reactivo = reactivos.find((m) => m.id === id);
  if (!reactivo) {
    res.status(404).json({ message: 'Pipeta no encontrada' });
    return;
  }
  res.json(reactivo);
};
