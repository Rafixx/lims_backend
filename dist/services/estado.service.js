"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadoService = void 0;
const DimEstado_1 = require("../models/DimEstado");
const Muestra_1 = require("../models/Muestra");
const Tecnica_1 = require("../models/Tecnica");
class EstadoService {
    // Obtener estados por entidad
    async getEstadosPorEntidad(entidad) {
        return DimEstado_1.DimEstado.findAll({
            where: {
                entidad,
                activo: true,
            },
            order: [
                ['orden', 'ASC'],
                ['nombre', 'ASC'],
            ],
        });
    }
    // Obtener estado inicial de una entidad
    async getEstadoInicial(entidad) {
        return DimEstado_1.DimEstado.findOne({
            where: {
                entidad,
                es_inicial: true,
                activo: true,
            },
        });
    }
    // Validar transición de estado
    async validarTransicion(entidad, estadoOrigenId, estadoDestinoId) {
        const [estadoOrigen, estadoDestino] = await Promise.all([
            DimEstado_1.DimEstado.findOne({ where: { id: estadoOrigenId, entidad } }),
            DimEstado_1.DimEstado.findOne({ where: { id: estadoDestinoId, entidad } }),
        ]);
        if (!estadoOrigen || !estadoDestino)
            return false;
        // Lógica de transición: solo se puede avanzar o retroceder un nivel
        const ordenOrigen = estadoOrigen.orden || 0;
        const ordenDestino = estadoDestino.orden || 0;
        return Math.abs(ordenDestino - ordenOrigen) <= 1;
    }
    // Cambiar estado de una entidad
    async cambiarEstadoGenerico(modelo, id, nuevoEstadoId, entidad, comentario) {
        const registro = await modelo.findByPk(id);
        if (!registro) {
            throw new Error(`${entidad} no encontrada`);
        }
        // Validar que el nuevo estado existe y está activo
        const nuevoEstado = await DimEstado_1.DimEstado.findOne({
            where: {
                id: nuevoEstadoId,
                entidad,
                activo: true,
            },
        });
        if (!nuevoEstado) {
            throw new Error(`Estado con ID ${nuevoEstadoId} no válido para ${entidad}`);
        }
        // Validar transición si hay estado actual
        if (registro.id_estado) {
            const puedeTransicionar = await this.validarTransicion(entidad, registro.id_estado, nuevoEstadoId);
            if (!puedeTransicionar) {
                throw new Error(`Transición no permitida desde estado actual a ${nuevoEstado.estado || 'estado desconocido'}`);
            }
        }
        // Preparar datos de actualización con tipado fuerte
        const datosActualizacion = {
            id_estado: nuevoEstadoId,
            fecha_estado: new Date(),
        };
        // Añadir comentario solo si el modelo lo soporta y se proporciona
        if (comentario && 'comentarios' in registro) {
            datosActualizacion.comentarios = comentario;
        }
        await registro.update(datosActualizacion);
        return registro;
    }
    // Type guard para verificar si el modelo tiene comentarios
    tieneComentarios(registro) {
        return 'comentarios' in registro;
    }
    // Método público para cambiar estado de muestra
    async cambiarEstadoMuestra(id, nuevoEstadoId, comentario) {
        return this.cambiarEstadoGenerico(Muestra_1.Muestra, id, nuevoEstadoId, 'MUESTRA', comentario);
    }
    // Método público para cambiar estado de técnica
    async cambiarEstadoTecnica(id, nuevoEstadoId, comentario) {
        return this.cambiarEstadoGenerico(Tecnica_1.Tecnica, id, nuevoEstadoId, 'TECNICA', comentario);
    }
    // Obtener estados disponibles para transición
    async getEstadosDisponibles(entidad, estadoActualId) {
        const todosLosEstados = await this.getEstadosPorEntidad(entidad);
        if (!estadoActualId) {
            return todosLosEstados;
        }
        // Filtrar estados a los que se puede transicionar
        const estadosPermitidos = [];
        for (const estado of todosLosEstados) {
            const puedeTransicionar = await this.validarTransicion(entidad, estadoActualId, estado.id);
            if (puedeTransicionar || estado.id === estadoActualId) {
                estadosPermitidos.push(estado);
            }
        }
        return estadosPermitidos;
    }
}
exports.EstadoService = EstadoService;
