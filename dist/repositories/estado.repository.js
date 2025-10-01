"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadoRepository = void 0;
const DimEstado_1 = require("../models/DimEstado");
class EstadoRepository {
    async findById(id) {
        return DimEstado_1.DimEstado.findByPk(id);
    }
    async findAll() {
        return DimEstado_1.DimEstado.findAll({
            where: { activo: true },
            order: [
                ['entidad', 'ASC'],
                ['orden', 'ASC'],
            ],
        });
    }
    async findByEntidad(entidad) {
        return DimEstado_1.DimEstado.findAll({
            where: {
                entidad,
                activo: true,
            },
            order: [
                ['orden', 'ASC'],
                ['estado', 'ASC'],
            ],
        });
    }
    async findByEntidadAndEstado(entidad, estado) {
        return DimEstado_1.DimEstado.findOne({
            where: {
                entidad,
                estado,
                activo: true,
            },
        });
    }
    async findEstadoInicial(entidad) {
        return DimEstado_1.DimEstado.findOne({
            where: {
                entidad,
                es_inicial: true,
                activo: true,
            },
        });
    }
    async findEstadosFinales(entidad) {
        return DimEstado_1.DimEstado.findAll({
            where: {
                entidad,
                es_final: true,
                activo: true,
            },
            order: [['orden', 'ASC']],
        });
    }
    async create(data) {
        return DimEstado_1.DimEstado.create(data);
    }
    async update(estado, data) {
        return estado.update(data);
    }
    async delete(estado) {
        // Soft delete - marcar como inactivo
        return estado.update({ activo: false });
    }
    async activate(estado) {
        return estado.update({ activo: true });
    }
    // Validar si un estado puede transicionar a otro
    async canTransition(entidad, estadoOrigenId, estadoDestinoId) {
        const [estadoOrigen, estadoDestino] = await Promise.all([
            this.findById(estadoOrigenId),
            this.findById(estadoDestinoId),
        ]);
        if (!estadoOrigen || !estadoDestino)
            return false;
        if (estadoOrigen.entidad !== entidad || estadoDestino.entidad !== entidad)
            return false;
        // Si el estado origen es final, no puede transicionar
        if (estadoOrigen.es_final)
            return false;
        // Lógica de transición: solo se puede avanzar o retroceder un nivel
        const ordenOrigen = estadoOrigen.orden || 0;
        const ordenDestino = estadoDestino.orden || 0;
        return Math.abs(ordenDestino - ordenOrigen) <= 1;
    }
    // Obtener estados disponibles para transición desde un estado actual
    async getEstadosDisponibles(entidad, estadoActualId) {
        const todosLosEstados = await this.findByEntidad(entidad);
        if (!estadoActualId) {
            return todosLosEstados;
        }
        const estadosPermitidos = [];
        for (const estado of todosLosEstados) {
            const puedeTransicionar = await this.canTransition(entidad, estadoActualId, estado.id);
            if (puedeTransicionar || estado.id === estadoActualId) {
                estadosPermitidos.push(estado);
            }
        }
        return estadosPermitidos;
    }
}
exports.EstadoRepository = EstadoRepository;
