// src/controllers/tecnicaReactivo.controller.ts
import { Request, Response, NextFunction } from 'express';
import { TecnicaReactivoService } from '../services/tecnicaReactivo.service';

// Extend Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number;
      username: string;
      id_rol: number;
    };
  }
}

const service = new TecnicaReactivoService();

export const getAllTecnicaReactivos = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tecnicasReactivos = await service.getAllTecnicaReactivos();
    res.json(tecnicasReactivos);
  } catch (error) {
    next(error);
  }
};

export const getTecnicaReactivoById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tecnicaReactivo = await service.getTecnicaReactivoById(
      Number(req.params.id)
    );
    res.json(tecnicaReactivo);
  } catch (error) {
    next(error);
  }
};

export const createTecnicaReactivo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tecnicaReactivo = await service.createTecnicaReactivo(req.body);
    res.status(201).json(tecnicaReactivo);
  } catch (error) {
    next(error);
  }
};

export const updateTecnicaReactivo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tecnicaReactivo = await service.updateTecnicaReactivo(
      Number(req.params.id),
      req.body
    );
    res.json(tecnicaReactivo);
  } catch (error) {
    next(error);
  }
};

export const deleteTecnicaReactivo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await service.deleteTecnicaReactivo(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const batchUpdateTecnicasReactivos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de "updates" en el body',
      });
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El array de "updates" no puede estar vacío',
      });
    }

    // Obtener el ID del usuario autenticado si existe
    const userId = req.user?.id;

    // Añadir updated_by/created_by a cada item
    const updatesWithUser = updates.map((item) => ({
      ...item,
      updated_by: userId,
      created_by: userId,
    }));

    const result = await service.batchUpdateTecnicasReactivos(updatesWithUser);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
