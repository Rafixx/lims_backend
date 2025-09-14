"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuestraRepository = void 0;
const Muestra_1 = require("../models/Muestra");
const Usuario_1 = require("../models/Usuario");
class MuestraRepository {
    async findById(id) {
        return Muestra_1.Muestra.findByPk(id, {
            include: [
                {
                    model: Usuario_1.Usuario,
                    as: 'tecnico_resp',
                    attributes: ['id_usuario', 'nombre', 'email'],
                },
            ],
        });
    }
    async findBySolicitudId(id_solicitud) {
        return Muestra_1.Muestra.findOne({
            where: { id_solicitud },
        });
    }
    async findAll() {
        return Muestra_1.Muestra.findAll({
            include: [
                {
                    model: Usuario_1.Usuario,
                    as: 'tecnico_resp',
                    attributes: ['id_usuario', 'nombre', 'email'],
                },
            ],
        });
    }
    async create(data) {
        return Muestra_1.Muestra.create(data);
    }
    async update(muestra, data) {
        return muestra.update(data);
    }
    async delete(muestra) {
        return muestra.destroy();
    }
}
exports.MuestraRepository = MuestraRepository;
