"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const Usuario_1 = require("../models/Usuario");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const UnauthorizedError_1 = require("../errors/UnauthorizedError");
const Rol_1 = require("../models/Rol");
class AuthService {
    async login(data) {
        const usuario = await Usuario_1.Usuario.scope('authScope').findOne({
            where: { username: data.username },
            include: [
                {
                    model: Rol_1.Rol,
                    as: 'rol',
                    attributes: ['name'],
                },
            ],
        });
        if (!usuario) {
            throw new UnauthorizedError_1.UnauthorizedError('Usuario no encontrado');
        }
        // Protección extra: que exista hash
        if (!usuario.passwordhash || typeof usuario.passwordhash !== 'string') {
            throw new UnauthorizedError_1.UnauthorizedError('El usuario no tiene credenciales válidas');
        }
        // Protección extra: que haya password en input
        if (!data.password || typeof data.password !== 'string') {
            throw new UnauthorizedError_1.UnauthorizedError('Contraseña no proporcionada');
        }
        const passwordValid = await bcrypt_1.default.compare(data.password, usuario.passwordhash);
        if (!passwordValid) {
            throw new UnauthorizedError_1.UnauthorizedError('Contraseña incorrecta');
        }
        const rolName = usuario.rol?.name || 'desconocido';
        const token = jsonwebtoken_1.default.sign({
            id: usuario.id_usuario,
            username: usuario.username,
            rol_name: rolName,
        }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        return {
            token,
            user: {
                id_usuario: usuario.id_usuario,
                username: usuario.username,
                nombre: usuario.nombre,
                email: usuario.email,
                rol_name: rolName,
            },
        };
    }
}
exports.AuthService = AuthService;
