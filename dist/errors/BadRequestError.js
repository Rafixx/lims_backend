"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = void 0;
class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BadRequestError';
        this.statusCode = 400;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BadRequestError = BadRequestError;
