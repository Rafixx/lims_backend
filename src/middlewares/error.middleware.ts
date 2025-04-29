import { Request, Response, NextFunction } from 'express';
import { ValidationError as SequelizeValidationError } from 'sequelize';
import { JsonWebTokenError } from 'jsonwebtoken';
import { BadRequestError } from '../errors/BadRequestError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { NotFoundError } from '../errors/NotFoundError';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error('[ErrorHandler]', err);

  if (err instanceof SequelizeValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors.map((e) => e.message),
    });
  }

  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }

  if (
    err instanceof BadRequestError ||
    err instanceof UnauthorizedError ||
    err instanceof NotFoundError
  ) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Default
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
};
