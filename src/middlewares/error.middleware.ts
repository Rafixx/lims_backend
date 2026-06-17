import { Request, Response, NextFunction } from 'express';
import { ValidationError as SequelizeValidationError } from 'sequelize';
import { JsonWebTokenError } from 'jsonwebtoken';
import multer from 'multer';
import { BadRequestError } from '../errors/BadRequestError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { NotFoundError } from '../errors/NotFoundError';
import { ConflictError } from '../errors/ConflictError';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error('[ErrorHandler]', err);

  // Multer: tamaño de archivo excedido o tipo no permitido (fileFilter cb(new Error(...)))
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        err.code === 'LIMIT_FILE_SIZE'
          ? 'El archivo es demasiado grande. Tamaño máximo: 10 MB'
          : `Error al procesar el archivo: ${err.message}`,
    });
  }
  if (err instanceof Error && err.message.startsWith('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

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
    err instanceof NotFoundError ||
    err instanceof ConflictError
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
