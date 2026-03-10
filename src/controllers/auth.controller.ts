import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (
    !username || typeof username !== 'string' || username.length > 50 ||
    !password || typeof password !== 'string' || password.length > 128
  ) {
    return res.status(400).json({ message: 'Datos de acceso inválidos' });
  }

  try {
    const { token, user } = await authService.login({ username: username.trim(), password });

    return res.status(200).json({
      token,
      user,
    });
  } catch (error: unknown) {
    console.error('[Login Error]', error);

    const err = error as { message?: string; statusCode?: number };

    return res.status(err.statusCode || 401).json({
      success: false,
      message: err.message || 'Credenciales inválidas',
    });
  }
};
