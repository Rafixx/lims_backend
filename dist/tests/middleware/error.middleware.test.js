"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_middleware_1 = require("../../middlewares/error.middleware");
const sequelize_1 = require("sequelize");
const jsonwebtoken_1 = require("jsonwebtoken");
describe('errorHandler middleware', () => {
    let req;
    let res;
    let next;
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
        const mockInstance = {};
        const errorItem = new sequelize_1.ValidationErrorItem('Campo requerido', 'notnull violation', 'campo', '', mockInstance, 'campo', 'notNull', []);
        const error = new sequelize_1.ValidationError('Validation failed', [
            errorItem,
        ]);
        (0, error_middleware_1.errorHandler)(error, req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Error de validación',
            errors: ['Campo requerido'],
        });
    });
    it('debería manejar errores de JWT inválido', () => {
        const error = new jsonwebtoken_1.JsonWebTokenError('jwt malformed');
        (0, error_middleware_1.errorHandler)(error, req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Token inválido o expirado',
        });
    });
    it('debería devolver 500 para errores genéricos', () => {
        const error = new Error('Error interno del servidor');
        (0, error_middleware_1.errorHandler)(error, req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Error interno del servidor',
            error: undefined,
        });
    });
});
