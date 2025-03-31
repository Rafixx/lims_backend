//src/controllers/tipoResultado.controller.ts
import { Request, Response } from 'express';
import { tiposResultado } from '../data/tipoResultado';
import { TipoResultado, TipoResultadoEnum } from '../data/tipos';

//Obtener todos los tipos de resultado
export const getTiposResultado = (req: Request, res: Response): void => {
  res.json(tiposResultado);
};

//Obtener un tipo de resultado por su id
export const getTipoResultadoById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const tipoResultado = tiposResultado.find((t) => t.id === id);
  if (!tipoResultado) {
    res.status(404).json({ message: 'Tipo de resultado no encontrado' });
    return;
  }
  res.json(tipoResultado);
};
