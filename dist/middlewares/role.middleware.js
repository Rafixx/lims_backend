"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = exports.isAdmin = void 0;
const isAdmin = (req, res, next) => {
    if (!req.user)
        return res.status(401).json({ message: 'No autenticado' });
    if (req.user.id_rol !== 1) {
        return res
            .status(403)
            .json({ message: 'Acceso restringido a administradores' });
    }
    next();
};
exports.isAdmin = isAdmin;
// Middleware genérico para roles
const hasRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ message: 'No autenticado' });
        if (!allowedRoles.includes(req.user.id_rol)) {
            return res.status(403).json({ message: 'Acceso denegado para este rol' });
        }
        next();
    };
};
exports.hasRole = hasRole;
