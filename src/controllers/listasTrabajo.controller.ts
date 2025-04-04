//src/controllers/listasTrabajo.controller.ts
import { Request, Response } from 'express';
import { listaTrabajo } from '../data/listaTrabajo';
// import { WorkList } from '../data/tipos';

//Obtener todas las listas de trabajo
export const getListasTrabajo = (req: Request, res: Response): void => {
  res.json(listaTrabajo);
};

//Obtener una lista de trabajo por su id
export const getListasTrabajoById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const listaTrabajoItem = listaTrabajo.find((p) => p.id === id);
  if (!listaTrabajoItem) {
    res.status(404).json({ message: 'Lista de trabajo no encontrada' });
    return;
  }
  res.json(listaTrabajoItem);
};
