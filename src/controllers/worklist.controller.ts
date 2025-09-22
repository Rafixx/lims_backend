import { Request, Response, NextFunction } from 'express';
import { WorklistService } from '../services/worklist.service';

const worklistService = new WorklistService();

export const getWorklists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const worklists = await worklistService.getAllWorklists();
    res.status(200).json(worklists);
  } catch (error) {
    next(error);
  }
};

export const getWorklistById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const worklist = await worklistService.getWorklistById(id);
    res.status(200).json(worklist);
  } catch (error) {
    next(error);
  }
};

export const getTecnicasById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const worklist = await worklistService.getTecnicasById(id);
    res.status(200).json(worklist);
  } catch (error) {
    next(error);
  }
};

export const createWorklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nuevaWorklist = await worklistService.createWorklist(req.body);
    res.status(201).json(nuevaWorklist);
  } catch (error) {
    next(error);
  }
};

export const updateWorklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const worklistActualizada = await worklistService.updateWorklist(
      id,
      req.body
    );
    res.status(200).json(worklistActualizada);
  } catch (error) {
    next(error);
  }
};

export const deleteWorklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const resultado = await worklistService.deleteWorklist(id);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};
