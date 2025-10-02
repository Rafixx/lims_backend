import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';

// Extend the Request interface to include user property
// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: number;
//         username: string;
//         id_rol: number;
//       };
//     }
//   }
// }

interface CustomJwtPayload extends BaseJwtPayload {
  id: number;
  username: string;
  id_rol: number;
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

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }
    req.user = decoded as CustomJwtPayload; // Guardamos el payload en la request
    next();
  });
};
