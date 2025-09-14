"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const usuario_repository_1 = require("../repositories/usuario.repository");
const BadRequestError_1 = require("../errors/BadRequestError");
class UsuarioService {
    constructor(usuarioRepo = new usuario_repository_1.UsuarioRepository()) {
        this.usuarioRepo = usuarioRepo;
    }
    async createUsuario(data) {
        const existing = await this.usuarioRepo.findByEmail(data.email);
        if (existing) {
            throw new BadRequestError_1.BadRequestError('El email ya está en uso');
        }
        const passwordhash = await bcrypt_1.default.hash(data.password, 10);
        return this.usuarioRepo.create({
            nombre: data.nombre,
            username: data.username,
            email: data.email,
            id_rol: data.id_rol,
            passwordhash,
        });
    }
    async getAllUsuarios() {
        return this.usuarioRepo.findAll();
    }
    async getUsuarioById(id) {
        const usuario = await this.usuarioRepo.findById(id);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }
        return usuario;
    }
    async findByEmail(email) {
        const usuario = await this.usuarioRepo.findByEmail(email);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }
        return usuario;
    }
    async updateUsuario(id, data) {
        const usuario = await this.usuarioRepo.findById(id);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }
        return this.usuarioRepo.update(usuario, data);
    }
    async deleteUsuario(id) {
        const usuario = await this.usuarioRepo.findById(id);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }
        await this.usuarioRepo.delete(usuario);
        return { message: 'Usuario eliminado correctamente' };
    }
}
exports.UsuarioService = UsuarioService;
