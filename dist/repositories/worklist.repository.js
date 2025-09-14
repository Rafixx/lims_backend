"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorklistRepository = void 0;
const sequelize_1 = require("sequelize");
const Worklist_1 = require("../models/Worklist");
const Tecnica_1 = require("../models/Tecnica");
const DimTecnicaProc_1 = require("../models/DimTecnicaProc");
const Muestra_1 = require("../models/Muestra");
const DimTipoMuestra_1 = require("../models/DimTipoMuestra");
const Usuario_1 = require("../models/Usuario");
/**
 * Repositorio para manejar las operaciones CRUD de Worklist
 */
class WorklistRepository {
    // ==================== OPERACIONES CRUD ====================
    /**
     * Crea un nuevo worklist
     * @param data Datos para crear el worklist
     * @returns Promise<Worklist> Worklist creado
     */
    async create(data) {
        try {
            return await Worklist_1.Worklist.create({
                ...data,
                create_dt: new Date(),
                update_dt: new Date(),
            });
        }
        catch (error) {
            console.error('Error al crear worklist:', error);
            throw new Error('Error al crear worklist');
        }
    }
    /**
     * Obtiene todos los worklists activos
     * @returns Promise<Worklist[]> Lista de worklists
     */
    async getAll() {
        try {
            return await Worklist_1.Worklist.findAll({
                where: {
                    delete_dt: {
                        [sequelize_1.Op.is]: null,
                    },
                },
                include: [
                    {
                        model: Tecnica_1.Tecnica,
                        as: 'tecnicas',
                        required: false,
                        where: {
                            delete_dt: {
                                [sequelize_1.Op.is]: null,
                            },
                        },
                        include: [
                            {
                                model: DimTecnicaProc_1.DimTecnicaProc,
                                as: 'tecnica_proc',
                                attributes: ['id', 'tecnica_proc'],
                                required: false,
                            },
                        ],
                    },
                ],
                order: [['create_dt', 'DESC']],
            });
        }
        catch (error) {
            console.error('Error al obtener worklists:', error);
            throw new Error('Error al obtener worklists');
        }
    }
    /**
     * Obtiene un worklist por ID
     * @param id ID del worklist
     * @returns Promise<Worklist | null> Worklist encontrado o null
     */
    async getById(id) {
        try {
            return await Worklist_1.Worklist.findOne({
                where: {
                    id_worklist: id,
                    delete_dt: {
                        [sequelize_1.Op.is]: null,
                    },
                },
                include: [
                    {
                        model: Tecnica_1.Tecnica,
                        as: 'tecnicas',
                        required: false,
                        where: {
                            delete_dt: {
                                [sequelize_1.Op.is]: null,
                            },
                        },
                        include: [
                            {
                                model: DimTecnicaProc_1.DimTecnicaProc,
                                as: 'tecnica_proc',
                            },
                            {
                                model: Muestra_1.Muestra,
                                as: 'muestra',
                                required: false,
                                include: [
                                    {
                                        model: DimTipoMuestra_1.DimTipoMuestra,
                                        as: 'tipo_muestra',
                                        attributes: ['tipo_muestra'],
                                    },
                                ],
                            },
                            {
                                model: Usuario_1.Usuario,
                                as: 'tecnico',
                                attributes: ['nombre', 'apellido'],
                                required: false,
                            },
                        ],
                    },
                ],
            });
        }
        catch (error) {
            console.error('Error al obtener worklist por ID:', error);
            throw new Error('Error al obtener worklist por ID');
        }
    }
    /**
     * Actualiza un worklist
     * @param id ID del worklist
     * @param data Datos para actualizar
     * @returns Promise<Worklist | null> Worklist actualizado o null
     */
    async update(id, data) {
        try {
            const [affectedCount] = await Worklist_1.Worklist.update({
                ...data,
                update_dt: new Date(),
            }, {
                where: {
                    id_worklist: id,
                    delete_dt: {
                        [sequelize_1.Op.is]: null,
                    },
                },
            });
            if (affectedCount === 0) {
                return null;
            }
            return await this.getById(id);
        }
        catch (error) {
            console.error('Error al actualizar worklist:', error);
            throw new Error('Error al actualizar worklist');
        }
    }
    /**
     * Elimina un worklist (soft delete)
     * @param id ID del worklist
     * @param deletedBy ID del usuario que elimina
     * @returns Promise<boolean> true si se eliminó, false si no se encontró
     */
    async delete(id, deletedBy) {
        try {
            const [affectedCount] = await Worklist_1.Worklist.update({
                delete_dt: new Date(),
                updated_by: deletedBy,
                update_dt: new Date(),
            }, {
                where: {
                    id_worklist: id,
                    delete_dt: {
                        [sequelize_1.Op.is]: null,
                    },
                },
            });
            return affectedCount > 0;
        }
        catch (error) {
            console.error('Error al eliminar worklist:', error);
            throw new Error('Error al eliminar worklist');
        }
    }
    // ==================== OPERACIONES ESPECÍFICAS DE WORKLIST ====================
    /**
     * Asigna técnicas a un worklist
     * @param idWorklist ID del worklist
     * @param idsTecnicas IDs de las técnicas a asignar
     * @param updatedBy ID del usuario que realiza la operación
     * @returns Promise<number> Número de técnicas asignadas
     */
    async setTecnicas(idWorklist, idsTecnicas, updatedBy) {
        try {
            const [affectedCount] = await Tecnica_1.Tecnica.update({
                id_worklist: idWorklist,
                updated_by: updatedBy,
                update_dt: new Date(),
            }, {
                where: {
                    id_tecnica: {
                        [sequelize_1.Op.in]: idsTecnicas,
                    },
                    delete_dt: {
                        [sequelize_1.Op.is]: null,
                    },
                },
            });
            return affectedCount;
        }
        catch (error) {
            console.error('Error al asignar técnicas al worklist:', error);
            throw new Error('Error al asignar técnicas al worklist');
        }
    }
    /**
     * Remueve técnicas de un worklist
     * @param idWorklist ID del worklist
     * @param idsTecnicas IDs de las técnicas a remover (opcional, si no se proporciona remueve todas)
     * @param updatedBy ID del usuario que realiza la operación
     * @returns Promise<number> Número de técnicas removidas
     */
    async removeTecnicas(idWorklist, idsTecnicas, updatedBy) {
        try {
            const whereCondition = {
                id_worklist: idWorklist,
                delete_dt: {
                    [sequelize_1.Op.is]: null,
                },
            };
            if (idsTecnicas && idsTecnicas.length > 0) {
                whereCondition.id_tecnica = { [sequelize_1.Op.in]: idsTecnicas };
            }
            const [affectedCount] = await Tecnica_1.Tecnica.update({
                id_worklist: undefined,
                updated_by: updatedBy,
                update_dt: new Date(),
            }, {
                where: whereCondition,
            });
            return affectedCount;
        }
        catch (error) {
            console.error('Error al remover técnicas del worklist:', error);
            throw new Error('Error al remover técnicas del worklist');
        }
    }
    /**
     * Obtiene estadísticas de un worklist
     * @param idWorklist ID del worklist
     * @returns Promise<WorklistStats> Estadísticas del worklist
     */
    async getStats(idWorklist) {
        try {
            const totalTecnicas = await Tecnica_1.Tecnica.count({
                where: {
                    id_worklist: idWorklist,
                    delete_dt: {
                        [sequelize_1.Op.is]: null,
                    },
                },
            });
            const tecnicasCompletadas = await Tecnica_1.Tecnica.count({
                where: {
                    id_worklist: idWorklist,
                    estado: 'COMPLETADA',
                    delete_dt: {
                        [sequelize_1.Op.is]: null,
                    },
                },
            });
            const tecnicasPendientes = await Tecnica_1.Tecnica.count({
                where: {
                    id_worklist: idWorklist,
                    estado: 'PENDIENTE',
                    delete_dt: {
                        [sequelize_1.Op.is]: null,
                    },
                },
            });
            const tecnicasEnProceso = await Tecnica_1.Tecnica.count({
                where: {
                    id_worklist: idWorklist,
                    estado: 'EN_PROCESO',
                    delete_dt: {
                        [sequelize_1.Op.is]: null,
                    },
                },
            });
            const porcentajeCompletado = totalTecnicas > 0 ? (tecnicasCompletadas / totalTecnicas) * 100 : 0;
            return {
                totalTecnicas,
                tecnicasCompletadas,
                tecnicasPendientes,
                tecnicasEnProceso,
                porcentajeCompletado: Math.round(porcentajeCompletado * 100) / 100, // Redondear a 2 decimales
            };
        }
        catch (error) {
            console.error('Error al obtener estadísticas del worklist:', error);
            throw new Error('Error al obtener estadísticas del worklist');
        }
    }
    /**
     * Obtiene técnicas agrupadas por proceso de un worklist específico
     * @param idWorklist ID del worklist
     * @returns Promise<TecnicasPorProceso[]> Lista de técnicas agrupadas por proceso
     */
    async getTecnicasAgrupadasPorProceso(idWorklist) {
        try {
            const resultado = await Tecnica_1.Tecnica.findAll({
                attributes: [
                    'id_tecnica_proc',
                    [(0, sequelize_1.col)('tecnica_proc.tecnica_proc'), 'tecnica_proc'],
                    [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('Tecnica.id_tecnica_proc')), 'count'],
                ],
                include: [
                    {
                        model: DimTecnicaProc_1.DimTecnicaProc,
                        as: 'tecnica_proc',
                        attributes: [],
                        required: true,
                        duplicating: false,
                    },
                ],
                where: {
                    id_worklist: idWorklist,
                    delete_dt: {
                        [sequelize_1.Op.is]: null,
                    },
                },
                group: ['Tecnica.id_tecnica_proc', 'tecnica_proc.tecnica_proc'],
                order: [['id_tecnica_proc', 'ASC']],
                raw: true,
                nest: false,
            });
            return resultado;
        }
        catch (error) {
            console.error('Error al obtener técnicas agrupadas por proceso:', error);
            throw new Error('Error al obtener técnicas agrupadas por proceso');
        }
    }
    /**
     * Obtiene técnicas sin asignar a ningún worklist
     * @returns Promise<Tecnica[]> Lista de técnicas sin asignar
     */
    async getTecnicasSinAsignar() {
        try {
            return await Tecnica_1.Tecnica.findAll({
                where: {
                    id_worklist: {
                        [sequelize_1.Op.is]: null,
                    },
                    delete_dt: {
                        [sequelize_1.Op.is]: null,
                    },
                },
                include: [
                    {
                        model: DimTecnicaProc_1.DimTecnicaProc,
                        as: 'tecnica_proc',
                        required: true,
                    },
                    {
                        model: Muestra_1.Muestra,
                        as: 'muestra',
                        required: false,
                        include: [
                            {
                                model: DimTipoMuestra_1.DimTipoMuestra,
                                as: 'tipo_muestra',
                                attributes: ['tipo_muestra'],
                                required: false,
                            },
                        ],
                    },
                ],
                order: [['id_tecnica_proc', 'ASC']],
            });
        }
        catch (error) {
            console.error('Error al obtener técnicas sin asignar:', error);
            throw new Error('Error al obtener técnicas sin asignar');
        }
    }
}
exports.WorklistRepository = WorklistRepository;
