import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const { token, user } = await authService.login({ username, password });

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
