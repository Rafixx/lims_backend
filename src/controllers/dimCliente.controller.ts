import { Request, Response, NextFunction } from 'express';
import { DimClienteService } from '../services/dimCliente.service';

const dimClienteService = new DimClienteService();

export const getClientes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientes = await dimClienteService.getAllClientes();
    res.status(200).json(clientes);
  } catch (error) {
    next(error);
  }
};

export const getClienteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const cliente = await dimClienteService.getClienteById(id);
    res.status(200).json(cliente);
  } catch (error) {
    next(error);
  }
};

export const createCliente = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nuevoCliente = await dimClienteService.createCliente(req.body);
    res.status(201).json(nuevoCliente);
  } catch (error) {
    next(error);
  }
};

export const updateCliente = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const clienteActualizado = await dimClienteService.updateCliente(
      id,
      req.body
    );
    res.status(200).json(clienteActualizado);
  } catch (error) {
    next(error);
  }
};

export const deleteCliente = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const result = await dimClienteService.deleteCliente(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
