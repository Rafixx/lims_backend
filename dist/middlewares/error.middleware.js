"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const sequelize_1 = require("sequelize");
const jsonwebtoken_1 = require("jsonwebtoken");
const BadRequestError_1 = require("../errors/BadRequestError");
const UnauthorizedError_1 = require("../errors/UnauthorizedError");
const NotFoundError_1 = require("../errors/NotFoundError");
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => {
    console.error('[ErrorHandler]', err);
    if (err instanceof sequelize_1.ValidationError) {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: err.errors.map((e) => e.message),
        });
    }
    if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado',
        });
    }
    if (err instanceof BadRequestError_1.BadRequestError ||
        err instanceof UnauthorizedError_1.UnauthorizedError ||
        err instanceof NotFoundError_1.NotFoundError) {
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
exports.errorHandler = errorHandler;
