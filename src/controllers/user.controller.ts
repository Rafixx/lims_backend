// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { usuarios } from '../data/usuarios';
import { Usuario } from '../data/tipos';

// Obtener todos los usuarios
export const getUsers = (req: Request, res: Response): void => {
  res.json(usuarios);
};

// Obtener un usuario por id
export const getUserById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const user = usuarios.find((u) => u.id === id);
  if (!user) {
    res.status(404).json({ message: 'Usuario no encontrado' });
    return;
  }
  res.json(user);
};

// Crear un nuevo usuario
export const createUser = (req: Request, res: Response): void => {
  const newUser: Usuario = {
    id: `user${usuarios.length + 1}`,
    ...req.body, // Se espera que el body contenga: nombre, email, rol, fechaCreacion
  };
  usuarios.push(newUser);
  res.status(201).json(newUser);
};

// Actualizar un usuario existente
export const updateUser = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = usuarios.findIndex((u) => u.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Usuario no encontrado' });
    return;
  }
  const updatedUser = {
    ...usuarios[index],
    ...req.body,
  };
  usuarios[index] = updatedUser;
  res.json(updatedUser);
};

// Eliminar un usuario
export const deleteUser = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = usuarios.findIndex((u) => u.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Usuario no encontrado' });
    return;
  }
  usuarios.splice(index, 1);
  res.status(204).send();
};
