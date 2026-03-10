import { Request, Response, NextFunction } from 'express';
import { UsuarioService } from '../services/usuario.service';

const usuarioService = new UsuarioService();

export const getUsuarios = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const usuarios = await usuarioService.getAllUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    next(error);
  }
};

export const getUsuarioById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const usuario = await usuarioService.getUsuarioById(id);
    res.status(200).json(usuario);
  } catch (error) {
    next(error);
  }
};

export const createUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.createUsuario(req.body);
    return res.status(201).json(usuario);
  } catch (error) {
    console.error('[CreateUsuario Controller Error]', error);

    if (
      error instanceof Error &&
      error.message.includes('email ya está en uso')
    ) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const usuarioActualizado = await usuarioService.updateUsuario(id, req.body);
    res.status(200).json(usuarioActualizado);
  } catch (error) {
    next(error);
  }
};

export const deleteUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const result = await usuarioService.deleteUsuario(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

  const { currentPassword, newPassword } = req.body;
  if (
    !currentPassword || typeof currentPassword !== 'string' ||
    !newPassword || typeof newPassword !== 'string'
  ) {
    return res.status(400).json({ message: 'Se requieren currentPassword y newPassword' });
  }

  try {
    const result = await usuarioService.changePassword(id, currentPassword, newPassword);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
