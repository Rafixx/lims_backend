import { errorHandler } from '../../middlewares/error.middleware';
import { Request, Response, NextFunction } from 'express';
import {
  ValidationError as SequelizeValidationError,
  ValidationErrorItem,
  Model,
} from 'sequelize';
import { JsonWebTokenError } from 'jsonwebtoken';

describe('errorHandler middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.NODE_ENV = 'test';
  });

  it('debería manejar errores de validación de Sequelize', () => {
    const mockInstance = {} as Model;

    const errorItem = new ValidationErrorItem(
      'Campo requerido',
      'notnull violation',
      'campo',
      '',
      mockInstance,
      'campo',
      'notNull',
      []
    );

    const error = new SequelizeValidationError('Validation failed', [
      errorItem,
    ]);

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error de validación',
      errors: ['Campo requerido'],
    });
  });

  it('debería manejar errores de JWT inválido', () => {
    const error = new JsonWebTokenError('jwt malformed');

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token inválido o expirado',
    });
  });

  it('debería devolver 500 para errores genéricos', () => {
    const error = new Error('Error interno del servidor');

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error interno del servidor',
      error: undefined,
    });
  });
});
