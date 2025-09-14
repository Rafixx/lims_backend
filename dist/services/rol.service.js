"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolService = void 0;
const rol_repository_1 = require("../repositories/rol.repository");
class RolService {
    constructor(rolRepo = new rol_repository_1.RolRepository()) {
        this.rolRepo = rolRepo;
    }
    async createRol(data) {
        return this.rolRepo.create(data);
    }
    async getRolById(id) {
        const rol = await this.rolRepo.findById(id);
        if (!rol) {
            throw new Error('Rol no encontrado');
        }
        return rol;
    }
    async getAllRoles() {
        return this.rolRepo.findAll();
    }
    async updateRol(id, data) {
        const rol = await this.rolRepo.findById(id);
        if (!rol) {
            throw new Error('Rol no encontrado');
        }
        return this.rolRepo.update(rol, data);
    }
    async deleteRol(id) {
        const rol = await this.rolRepo.findById(id);
        if (!rol) {
            throw new Error('Rol no encontrado');
        }
        await this.rolRepo.delete(rol);
        return { message: 'Rol eliminado correctamente' };
    }
}
exports.RolService = RolService;
