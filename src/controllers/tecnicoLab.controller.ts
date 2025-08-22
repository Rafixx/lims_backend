import { Request, Response, NextFunction } from 'express';
import { TecnicoLabService } from '../services/tecnicoLab.service';

const tecnicoLabService = new TecnicoLabService();

export const getAllTecnicoLab = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tecnicos = await tecnicoLabService.getAllTecnicoLabService();
    res.json(tecnicos);
  } catch (error) {
    next(error);
  }
};
