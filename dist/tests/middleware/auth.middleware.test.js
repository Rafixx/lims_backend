"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
jest.mock('jsonwebtoken');
describe('authenticateToken middleware', () => {
    let req;
    let res;
    let next;
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
        (0, auth_middleware_1.authenticateToken)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Token no proporcionado',
        });
        expect(next).not.toHaveBeenCalled();
    });
    it('debería devolver 403 si el token es inválido', () => {
        jsonwebtoken_1.default.verify.mockImplementation((_, __, cb) => cb(new Error('Token inválido'), null));
        (0, auth_middleware_1.authenticateToken)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Token inválido o expirado',
        });
        expect(next).not.toHaveBeenCalled();
    });
    it('debería asignar el usuario y llamar a next si el token es válido', () => {
        const mockPayload = { id: 1, username: 'test', id_rol: 1 };
        jsonwebtoken_1.default.verify.mockImplementation((_, __, cb) => cb(null, mockPayload));
        (0, auth_middleware_1.authenticateToken)(req, res, next);
        expect(req.user).toEqual(mockPayload);
        expect(next).toHaveBeenCalled();
    });
});
