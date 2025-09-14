"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioRepository = void 0;
const Usuario_1 = require("../models/Usuario");
class UsuarioRepository {
    async findByEmail(email) {
        return Usuario_1.Usuario.findOne({
            where: { email },
        });
    }
    async findById(id) {
        return Usuario_1.Usuario.findByPk(id);
    }
    async findAll() {
        return Usuario_1.Usuario.findAll();
    }
    async create(data) {
        return Usuario_1.Usuario.create(data);
    }
    async update(usuario, data) {
        return usuario.update(data);
    }
    async delete(usuario) {
        return usuario.destroy();
    }
}
exports.UsuarioRepository = UsuarioRepository;
