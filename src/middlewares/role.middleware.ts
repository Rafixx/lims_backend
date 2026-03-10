import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: 'No autenticado' });

  if (req.user.id_rol == null || req.user.id_rol !== 1) {
    return res
      .status(403)
      .json({ message: 'Acceso restringido a administradores' });
  }

  next();
};

// Middleware genérico para roles
export const hasRole = (allowedRoles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });

    if (req.user.id_rol == null || !allowedRoles.includes(req.user.id_rol)) {
      return res.status(403).json({ message: 'Acceso denegado para este rol' });
    }

    next();
  };
};
