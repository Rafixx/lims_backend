//src/controllers/pipeta.controller.ts
import { Request, Response } from 'express';
// import { Pipeta } from '../data/tipos';
import { pipetas } from '../data/pipetas';

// Obtener todas las pipetas
export const getPipetas = (req: Request, res: Response): void => {
  res.json(pipetas);
};

// Obtener una pipeta por su id
export const getPipetaById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const pipeta = pipetas.find((m) => m.id === id);
  if (!pipeta) {
    res.status(404).json({ message: 'Pipeta no encontrada' });
    return;
  }
  res.json(pipeta);
};
