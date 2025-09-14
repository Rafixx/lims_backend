"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.worklistController = exports.WorklistController = void 0;
const worklist_service_1 = require("../services/worklist.service");
const tecnica_service_1 = require("../services/tecnica.service");
const BadRequestError_1 = require("../errors/BadRequestError");
const NotFoundError_1 = require("../errors/NotFoundError");
/**
 * Controlador para manejar las peticiones HTTP relacionadas con Worklist
 */
class WorklistController {
    constructor() {
        this.worklistService = new worklist_service_1.WorklistService();
        this.tecnicaService = new tecnica_service_1.TecnicaService();
    }
    // ==================== OPERACIONES CRUD ====================
    /**
     * Crea un nuevo worklist
     * POST /api/worklist
     */
    async create(req, res) {
        try {
            const { nombre, userId } = req.body;
            // const userId = req.user?.id; // Asumiendo que tienes middleware de auth
            const worklist = await this.worklistService.create({ nombre }, userId);
            res.status(201).json({
                success: true,
                data: worklist,
                message: 'Worklist creado correctamente',
            });
        }
        catch (error) {
            console.error('Error en controlador al crear worklist:', error);
            if (error instanceof BadRequestError_1.BadRequestError) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al crear worklist',
                error: process.env.NODE_ENV === 'development' ? error : undefined,
            });
        }
    }
    /**
     * Obtiene todos los worklists
     * GET /api/worklist
     */
    async getAll(req, res) {
        try {
            const worklists = await this.worklistService.getAll();
            res.status(200).json({
                success: true,
                data: worklists,
                message: 'Worklists obtenidos correctamente',
            });
        }
        catch (error) {
            console.error('Error en controlador al obtener worklists:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener worklists',
                error: process.env.NODE_ENV === 'development' ? error : undefined,
            });
        }
    }
    /**
     * Obtiene un worklist por ID
     * GET /api/worklist/:id
     */
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const worklist = await this.worklistService.getById(id);
            res.status(200).json({
                success: true,
                data: worklist,
                message: 'Worklist obtenido correctamente',
            });
        }
        catch (error) {
            console.error('Error en controlador al obtener worklist por ID:', error);
            if (error instanceof BadRequestError_1.BadRequestError) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            if (error instanceof NotFoundError_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener worklist',
                error: process.env.NODE_ENV === 'development' ? error : undefined,
            });
        }
    }
    /**
     * Actualiza un worklist
     * PUT /api/worklist/:id
     */
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { nombre, userId } = req.body;
            // const userId = req.user?.id;
            const worklist = await this.worklistService.update(id, { nombre }, userId);
            res.status(200).json({
                success: true,
                data: worklist,
                message: 'Worklist actualizado correctamente',
            });
        }
        catch (error) {
            console.error('Error en controlador al actualizar worklist:', error);
            if (error instanceof BadRequestError_1.BadRequestError) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            if (error instanceof NotFoundError_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al actualizar worklist',
                error: process.env.NODE_ENV === 'development' ? error : undefined,
            });
        }
    }
    /**
     * Elimina un worklist
     * DELETE /api/worklist/:id
     */
    async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { userId } = req.body;
            // const userId = req.user?.id;
            await this.worklistService.delete(id, userId);
            res.status(200).json({
                success: true,
                message: 'Worklist eliminado correctamente',
            });
        }
        catch (error) {
            console.error('Error en controlador al eliminar worklist:', error);
            if (error instanceof BadRequestError_1.BadRequestError) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            if (error instanceof NotFoundError_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al eliminar worklist',
                error: process.env.NODE_ENV === 'development' ? error : undefined,
            });
        }
    }
    // ==================== OPERACIONES ESPECÍFICAS DE WORKLIST ====================
    /**
     * Asigna técnicas a un worklist
     * POST /api/worklist/:id/asignar-tecnicas
     */
    async setTecnicas(req, res) {
        try {
            const idWorklist = parseInt(req.params.id);
            const { idsTecnicas, userId } = req.body;
            // const userId = req.user?.id;
            const tecnicasAsignadas = await this.worklistService.setTecnicas(idWorklist, { idsTecnicas }, userId);
            res.status(200).json({
                success: true,
                data: { tecnicasAsignadas },
                message: `${tecnicasAsignadas} técnicas asignadas al worklist correctamente`,
            });
        }
        catch (error) {
            console.error('Error en controlador al asignar técnicas:', error);
            if (error instanceof BadRequestError_1.BadRequestError) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            if (error instanceof NotFoundError_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al asignar técnicas',
                error: process.env.NODE_ENV === 'development' ? error : undefined,
            });
        }
    }
    /**
     * Remueve técnicas de un worklist
     * DELETE /api/worklist/:id/remover-tecnicas
     */
    async removeTecnicas(req, res) {
        try {
            const idWorklist = parseInt(req.params.id);
            const { idsTecnicas, userId } = req.body; // Opcional
            // const userId = req.user?.id;
            const tecnicasRemovidas = await this.worklistService.removeTecnicas(idWorklist, idsTecnicas, userId);
            res.status(200).json({
                success: true,
                data: { tecnicasRemovidas },
                message: `${tecnicasRemovidas} técnicas removidas del worklist correctamente`,
            });
        }
        catch (error) {
            console.error('Error en controlador al remover técnicas:', error);
            if (error instanceof BadRequestError_1.BadRequestError) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            if (error instanceof NotFoundError_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al remover técnicas',
                error: process.env.NODE_ENV === 'development' ? error : undefined,
            });
        }
    }
    /**
     * Obtiene estadísticas de un worklist
     * GET /api/worklist/:id/estadisticas
     */
    async getStats(req, res) {
        try {
            const idWorklist = parseInt(req.params.id);
            const estadisticas = await this.worklistService.getStats(idWorklist);
            res.status(200).json({
                success: true,
                data: estadisticas,
                message: 'Estadísticas del worklist obtenidas correctamente',
            });
        }
        catch (error) {
            console.error('Error en controlador al obtener estadísticas:', error);
            if (error instanceof BadRequestError_1.BadRequestError) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            if (error instanceof NotFoundError_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener estadísticas',
                error: process.env.NODE_ENV === 'development' ? error : undefined,
            });
        }
    }
    /**
     * Obtiene técnicas agrupadas por proceso de un worklist específico
     * GET /api/worklist/:id/tecnicas-agrupadas
     */
    async getTecnicasAgrupadasPorProceso(req, res) {
        try {
            const idWorklist = parseInt(req.params.id);
            const tecnicasAgrupadas = await this.worklistService.getTecnicasAgrupadasPorProceso(idWorklist);
            res.status(200).json({
                success: true,
                data: tecnicasAgrupadas,
                message: 'Técnicas agrupadas por proceso obtenidas correctamente',
            });
        }
        catch (error) {
            console.error('Error en controlador al obtener técnicas agrupadas:', error);
            if (error instanceof BadRequestError_1.BadRequestError) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener técnicas agrupadas',
                error: process.env.NODE_ENV === 'development' ? error : undefined,
            });
        }
    }
    /**
     * Obtiene técnicas sin asignar a ningún worklist
     * GET /api/worklist/tecnicas-sin-asignar
     */
    async getTecnicasSinAsignar(req, res) {
        try {
            const tecnicas = await this.worklistService.getTecnicasSinAsignar();
            res.status(200).json({
                success: true,
                data: tecnicas,
                message: 'Técnicas sin asignar obtenidas correctamente',
            });
        }
        catch (error) {
            console.error('Error en controlador al obtener técnicas sin asignar:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener técnicas sin asignar',
                error: process.env.NODE_ENV === 'development' ? error : undefined,
            });
        }
    }
    // ==================== ENDPOINTS PARA OPERACIONES DE TÉCNICA (delegación) ====================
    /**
     * Asigna un técnico a una técnica (delegación a TecnicaController)
     * PATCH /api/worklist/tecnica/:idTecnica/asignar
     */
    async asignarTecnico(req, res) {
        try {
            const idTecnica = parseInt(req.params.idTecnica);
            const { id_tecnico_resp } = req.body;
            const tecnica = await this.tecnicaService.asignarTecnico(idTecnica, id_tecnico_resp);
            res.status(200).json({
                success: true,
                data: tecnica,
                message: 'Técnico asignado correctamente',
            });
        }
        catch (error) {
            console.error('Error en controlador al asignar técnico:', error);
            if (error instanceof BadRequestError_1.BadRequestError) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            if (error instanceof NotFoundError_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al asignar técnico',
                error: process.env.NODE_ENV === 'development' ? error : undefined,
            });
        }
    }
    /**
     * Inicia una técnica (delegación a TecnicaController)
     * PATCH /api/worklist/tecnica/:idTecnica/iniciar
     */
    async iniciarTecnica(req, res) {
        try {
            const idTecnica = parseInt(req.params.idTecnica);
            const tecnica = await this.tecnicaService.iniciarTecnica(idTecnica);
            res.status(200).json({
                success: true,
                data: tecnica,
                message: 'Técnica iniciada correctamente',
            });
        }
        catch (error) {
            console.error('Error en controlador al iniciar técnica:', error);
            if (error instanceof BadRequestError_1.BadRequestError) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            if (error instanceof NotFoundError_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al iniciar técnica',
                error: process.env.NODE_ENV === 'development' ? error : undefined,
            });
        }
    }
    /**
     * Completa una técnica (delegación a TecnicaController)
     * PATCH /api/worklist/tecnica/:idTecnica/completar
     */
    async completarTecnica(req, res) {
        try {
            const idTecnica = parseInt(req.params.idTecnica);
            const { comentarios } = req.body;
            const tecnica = await this.tecnicaService.completarTecnica(idTecnica, comentarios);
            res.status(200).json({
                success: true,
                data: tecnica,
                message: 'Técnica completada correctamente',
            });
        }
        catch (error) {
            console.error('Error en controlador al completar técnica:', error);
            if (error instanceof BadRequestError_1.BadRequestError) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            if (error instanceof NotFoundError_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al completar técnica',
                error: process.env.NODE_ENV === 'development' ? error : undefined,
            });
        }
    }
}
exports.WorklistController = WorklistController;
// Exportar instancia singleton del controlador
exports.worklistController = new WorklistController();
