import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';

jest.mock('jsonwebtoken');

describe('authenticateToken middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer test-token',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('debería devolver 401 si no hay token', () => {
    req.headers = {};

    authenticateToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token no proporcionado',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería devolver 403 si el token es inválido', () => {
    (jwt.verify as jest.Mock).mockImplementation((_, __, cb) =>
      cb(new Error('Token inválido'), null)
    );

    authenticateToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token inválido o expirado',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería asignar el usuario y llamar a next si el token es válido', () => {
    const mockPayload = { id: 1, username: 'test', id_rol: 1 };
    (jwt.verify as jest.Mock).mockImplementation((_, __, cb) =>
      cb(null, mockPayload)
    );

    authenticateToken(req as Request, res as Response, next);

    expect(req.user).toEqual(mockPayload);
    expect(next).toHaveBeenCalled();
  });
});
