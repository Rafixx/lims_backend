"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadoController = void 0;
const estado_service_1 = require("../services/estado.service");
const estado_repository_1 = require("../repositories/estado.repository");
const NotFoundError_1 = require("../errors/NotFoundError");
const BadRequestError_1 = require("../errors/BadRequestError");
class EstadoController {
    constructor() {
        // GET /api/estados
        this.getAllEstados = async (req, res, next) => {
            try {
                const estados = await this.estadoRepository.findAll();
                res.json(estados);
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/estados/:id
        this.getEstadoById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const estado = await this.estadoRepository.findById(parseInt(id));
                if (!estado) {
                    throw new NotFoundError_1.NotFoundError(`Estado con ID ${id} no encontrado`);
                }
                res.json(estado);
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/estados/entidad/:entidad
        this.getEstadosByEntidad = async (req, res, next) => {
            try {
                const { entidad } = req.params;
                if (entidad !== 'MUESTRA' && entidad !== 'TECNICA') {
                    throw new BadRequestError_1.BadRequestError('Entidad debe ser MUESTRA o TECNICA');
                }
                const estados = await this.estadoService.getEstadosPorEntidad(entidad);
                res.json(estados);
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/estados/entidad/:entidad/inicial
        this.getEstadoInicial = async (req, res, next) => {
            try {
                const { entidad } = req.params;
                if (entidad !== 'MUESTRA' && entidad !== 'TECNICA') {
                    throw new BadRequestError_1.BadRequestError('Entidad debe ser MUESTRA o TECNICA');
                }
                const estadoInicial = await this.estadoRepository.findEstadoInicial(entidad);
                if (!estadoInicial) {
                    throw new NotFoundError_1.NotFoundError(`Estado inicial para ${entidad} no encontrado`);
                }
                res.json(estadoInicial);
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/estados/entidad/:entidad/finales
        this.getEstadosFinales = async (req, res, next) => {
            try {
                const { entidad } = req.params;
                if (entidad !== 'MUESTRA' && entidad !== 'TECNICA') {
                    throw new BadRequestError_1.BadRequestError('Entidad debe ser MUESTRA o TECNICA');
                }
                const estadosFinales = await this.estadoRepository.findEstadosFinales(entidad);
                res.json(estadosFinales);
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/estados/entidad/:entidad/disponibles/:estadoActualId?
        this.getEstadosDisponibles = async (req, res, next) => {
            try {
                const { entidad, estadoActualId } = req.params;
                if (entidad !== 'MUESTRA' && entidad !== 'TECNICA') {
                    throw new BadRequestError_1.BadRequestError('Entidad debe ser MUESTRA o TECNICA');
                }
                const estadoId = estadoActualId ? parseInt(estadoActualId) : undefined;
                const estadosDisponibles = await this.estadoRepository.getEstadosDisponibles(entidad, estadoId);
                res.json(estadosDisponibles);
            }
            catch (error) {
                next(error);
            }
        };
        // POST /api/estados/validar-transicion
        this.validarTransicion = async (req, res, next) => {
            try {
                const { entidad, estadoOrigenId, estadoDestinoId } = req.body;
                if (!entidad || !estadoOrigenId || !estadoDestinoId) {
                    throw new BadRequestError_1.BadRequestError('Faltan parámetros requeridos: entidad, estadoOrigenId, estadoDestinoId');
                }
                if (entidad !== 'MUESTRA' && entidad !== 'TECNICA') {
                    throw new BadRequestError_1.BadRequestError('Entidad debe ser MUESTRA o TECNICA');
                }
                const esValida = await this.estadoService.validarTransicion(entidad, estadoOrigenId, estadoDestinoId);
                res.json({ valida: esValida });
            }
            catch (error) {
                next(error);
            }
        };
        // POST /api/estados/cambiar/muestra/:muestraId
        this.cambiarEstadoMuestra = async (req, res, next) => {
            try {
                const { muestraId } = req.params;
                const { nuevoEstadoId, observaciones } = req.body;
                if (!nuevoEstadoId) {
                    throw new BadRequestError_1.BadRequestError('Se requiere nuevoEstadoId');
                }
                const resultado = await this.estadoService.cambiarEstadoMuestra(parseInt(muestraId), nuevoEstadoId, observaciones);
                res.json({
                    success: true,
                    message: 'Estado de muestra actualizado correctamente',
                    data: resultado,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // POST /api/estados/cambiar/tecnica/:tecnicaId
        this.cambiarEstadoTecnica = async (req, res, next) => {
            try {
                const { tecnicaId } = req.params;
                const { nuevoEstadoId, observaciones } = req.body;
                if (!nuevoEstadoId) {
                    throw new BadRequestError_1.BadRequestError('Se requiere nuevoEstadoId');
                }
                const resultado = await this.estadoService.cambiarEstadoTecnica(parseInt(tecnicaId), nuevoEstadoId, observaciones);
                res.json({
                    success: true,
                    message: 'Estado de técnica actualizado correctamente',
                    data: resultado,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // POST /api/estados
        this.createEstado = async (req, res, next) => {
            try {
                const estadoData = req.body;
                // Validaciones básicas
                if (!estadoData.entidad || !estadoData.estado) {
                    throw new BadRequestError_1.BadRequestError('Faltan campos requeridos: entidad, estado');
                }
                if (estadoData.entidad !== 'MUESTRA' &&
                    estadoData.entidad !== 'TECNICA') {
                    throw new BadRequestError_1.BadRequestError('Entidad debe ser MUESTRA o TECNICA');
                }
                const nuevoEstado = await this.estadoRepository.create(estadoData);
                res.status(201).json(nuevoEstado);
            }
            catch (error) {
                next(error);
            }
        };
        // PUT /api/estados/:id
        this.updateEstado = async (req, res, next) => {
            try {
                const { id } = req.params;
                const estadoData = req.body;
                const estado = await this.estadoRepository.findById(parseInt(id));
                if (!estado) {
                    throw new NotFoundError_1.NotFoundError(`Estado con ID ${id} no encontrado`);
                }
                const estadoActualizado = await this.estadoRepository.update(estado, estadoData);
                res.json(estadoActualizado);
            }
            catch (error) {
                next(error);
            }
        };
        // DELETE /api/estados/:id
        this.deleteEstado = async (req, res, next) => {
            try {
                const { id } = req.params;
                const estado = await this.estadoRepository.findById(parseInt(id));
                if (!estado) {
                    throw new NotFoundError_1.NotFoundError(`Estado con ID ${id} no encontrado`);
                }
                await this.estadoRepository.delete(estado);
                res.json({ message: 'Estado desactivado correctamente' });
            }
            catch (error) {
                next(error);
            }
        };
        // POST /api/estados/:id/activate
        this.activateEstado = async (req, res, next) => {
            try {
                const { id } = req.params;
                const estado = await this.estadoRepository.findById(parseInt(id));
                if (!estado) {
                    throw new NotFoundError_1.NotFoundError(`Estado con ID ${id} no encontrado`);
                }
                await this.estadoRepository.activate(estado);
                res.json({ message: 'Estado activado correctamente' });
            }
            catch (error) {
                next(error);
            }
        };
        this.estadoService = new estado_service_1.EstadoService();
        this.estadoRepository = new estado_repository_1.EstadoRepository();
    }
}
exports.EstadoController = EstadoController;
