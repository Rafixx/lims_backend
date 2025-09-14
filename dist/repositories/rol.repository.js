"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolRepository = void 0;
const Rol_1 = require("../models/Rol");
class RolRepository {
    async findById(id) {
        return Rol_1.Rol.findByPk(id);
    }
    async findAll() {
        return Rol_1.Rol.findAll();
    }
    async findByName(name) {
        return Rol_1.Rol.findOne({ where: { name } });
    }
    async create(data) {
        return Rol_1.Rol.create(data);
    }
    async update(rol, data) {
        return rol.update(data);
    }
    async delete(rol) {
        return rol.destroy();
    }
}
exports.RolRepository = RolRepository;
