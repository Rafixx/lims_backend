// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { usuarios } from '../data/usuarios';

export const loginUser = (req: Request, res: Response): void => {
  const { email, password } = req.body;

  // Para esta demo, asumimos que la contraseña correcta es "password"
  const user = usuarios.find((u) => u.email === email);
  if (!user || password !== 'password') {
    res.status(401).json({ message: 'Credenciales inválidas' });
    return;
  }

  // Generar el token (asegúrate de definir JWT_SECRET en tus variables de entorno)
  const token = jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET || 'secretKey',
    { expiresIn: '1h' }
  );

  res.json({ token, user });
};
