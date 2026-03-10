import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';

// Extend Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number;
      username: string;
      id_rol: number | null;
      rol_name: string;
    };
  }
}

interface CustomJwtPayload extends BaseJwtPayload {
  id: number;
  username: string;
  id_rol: number | null;
  rol_name: string;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Espera formato: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ message: 'Configuración de servidor inválida' });
  }

  jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }
    req.user = decoded as CustomJwtPayload;
    next();
  });
};
