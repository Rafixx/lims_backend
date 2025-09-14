"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const role_middleware_1 = require("../../middlewares/role.middleware");
const role_middleware_2 = require("../../middlewares/role.middleware");
describe('isAdmin middleware', () => {
    let req;
    let res;
    let next;
    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });
    it('debería devolver 401 si no hay usuario autenticado', () => {
        req = {};
        (0, role_middleware_1.isAdmin)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No autenticado' });
        expect(next).not.toHaveBeenCalled();
    });
    it('debería devolver 403 si el usuario no es admin', () => {
        req = {
            user: {
                id: 1,
                username: 'user',
                id_rol: 2,
            },
        };
        (0, role_middleware_1.isAdmin)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Acceso restringido a administradores',
        });
        expect(next).not.toHaveBeenCalled();
    });
    it('debería permitir acceso si el usuario es admin', () => {
        req = {
            user: {
                id: 1,
                username: 'admin',
                id_rol: 1,
            },
        };
        (0, role_middleware_1.isAdmin)(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});
describe('hasRole middleware', () => {
    let req;
    let res;
    let next;
    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });
    it('debería devolver 401 si no hay usuario autenticado', () => {
        req = {};
        (0, role_middleware_2.hasRole)([1, 2])(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No autenticado' });
        expect(next).not.toHaveBeenCalled();
    });
    it('debería devolver 403 si el rol del usuario no está permitido', () => {
        req = {
            user: { id: 1, username: 'user', id_rol: 3 },
        };
        (0, role_middleware_2.hasRole)([1, 2])(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Acceso denegado para este rol',
        });
        expect(next).not.toHaveBeenCalled();
    });
    it('debería permitir el acceso si el rol del usuario está permitido', () => {
        req = {
            user: { id: 2, username: 'tecnico', id_rol: 2 },
        };
        (0, role_middleware_2.hasRole)([1, 2])(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});
