import { Request, Response, NextFunction } from 'express';
import { DimPlantillaTecnicaService } from '../services/dimPlantillaTecnica.service';

const dimPlantillaTecnicaService = new DimPlantillaTecnicaService();

export const getPlantillasTecnicas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const plantillas =
      await dimPlantillaTecnicaService.getAllPlantillasTecnicas();
    res.status(200).json(plantillas);
  } catch (error) {
    next(error);
  }
};

export const getPlantillaTecnicaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const plantilla =
      await dimPlantillaTecnicaService.getPlantillaTecnicaById(id);
    res.status(200).json(plantilla);
  } catch (error) {
    next(error);
  }
};

export const createPlantillaTecnica = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nuevaPlantilla =
      await dimPlantillaTecnicaService.createPlantillaTecnica(req.body);
    res.status(201).json(nuevaPlantilla);
  } catch (error) {
    next(error);
  }
};

export const updatePlantillaTecnica = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const plantillaActualizada =
      await dimPlantillaTecnicaService.updatePlantillaTecnica(id, req.body);
    res.status(200).json(plantillaActualizada);
  } catch (error) {
    next(error);
  }
};

export const deletePlantillaTecnica = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const result = await dimPlantillaTecnicaService.deletePlantillaTecnica(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
