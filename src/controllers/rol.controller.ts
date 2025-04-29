import { Request, Response, NextFunction } from 'express';
import { RolService } from '../services/rol.service';

const rolService = new RolService();

export const getRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roles = await rolService.getAllRoles();
    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};

export const getRolById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const rol = await rolService.getRolById(id);
    res.status(200).json(rol);
  } catch (error) {
    next(error);
  }
};

export const createRol = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nuevoRol = await rolService.createRol(req.body);
    res.status(201).json(nuevoRol);
  } catch (error) {
    next(error);
  }
};

export const updateRol = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const rolActualizado = await rolService.updateRol(id, req.body);
    res.status(200).json(rolActualizado);
  } catch (error) {
    next(error);
  }
};

export const deleteRol = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const result = await rolService.deleteRol(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
