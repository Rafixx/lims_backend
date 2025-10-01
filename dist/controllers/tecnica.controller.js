"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cambiarEstadoTecnica = exports.getEstadisticasWorklist = exports.getTecnicasConMuestra = exports.getTecnicasPendientesPorProceso = exports.completarTecnica = exports.iniciarTecnica = exports.asignarTecnico = exports.deleteTecnica = exports.updateTecnica = exports.createTecnica = exports.getTecnicasByMuestraId = exports.getTecnicaById = exports.getTecnicas = void 0;
const tecnica_service_1 = require("../services/tecnica.service");
const tecnicaService = new tecnica_service_1.TecnicaService();
const getTecnicas = async (req, res, next) => {
    try {
        const tecnicas = await tecnicaService.getAllTecnicas();
        res.status(200).json(tecnicas);
    }
    catch (error) {
        next(error);
    }
};
exports.getTecnicas = getTecnicas;
const getTecnicaById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const tecnica = await tecnicaService.getTecnicaById(id);
        res.status(200).json(tecnica);
    }
    catch (error) {
        next(error);
    }
};
exports.getTecnicaById = getTecnicaById;
// export const getTecnicasBySolicitudId = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const id = Number(req.params.id);
//   try {
//     const tecnicas = await tecnicaService.getTecnicaBySolicitudId(id);
//     res.status(200).json(tecnicas);
//   } catch (error) {
//     next(error);
//   }
// };
const getTecnicasByMuestraId = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const tecnicas = await tecnicaService.getTecnicaByMuestraId(id);
        res.status(200).json(tecnicas);
    }
    catch (error) {
        next(error);
    }
};
exports.getTecnicasByMuestraId = getTecnicasByMuestraId;
const createTecnica = async (req, res, next) => {
    try {
        const nuevaTecnica = await tecnicaService.createTecnica(req.body);
        res.status(201).json(nuevaTecnica);
    }
    catch (error) {
        next(error);
    }
};
exports.createTecnica = createTecnica;
const updateTecnica = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const tecnicaActualizada = await tecnicaService.updateTecnica(id, req.body);
        res.status(200).json(tecnicaActualizada);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTecnica = updateTecnica;
const deleteTecnica = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const result = await tecnicaService.deleteTecnica(id);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTecnica = deleteTecnica;
/**
 * Asigna un técnico responsable a una técnica
 * PATCH /api/tecnicas/:idTecnica/asignar
 */
const asignarTecnico = async (req, res, next) => {
    try {
        const { idTecnica } = req.params;
        const { id_tecnico_resp } = req.body;
        const id = parseInt(idTecnica, 10);
        if (isNaN(id) || id <= 0) {
            res.status(400).json({
                success: false,
                message: 'ID de técnica inválido',
            });
            return;
        }
        if (!id_tecnico_resp || isNaN(parseInt(id_tecnico_resp, 10))) {
            res.status(400).json({
                success: false,
                message: 'ID de técnico responsable inválido',
            });
            return;
        }
        const tecnica = await tecnicaService.asignarTecnico(id, parseInt(id_tecnico_resp, 10));
        res.status(200).json({
            success: true,
            data: tecnica,
            message: 'Técnico asignado correctamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.asignarTecnico = asignarTecnico;
/**
 * Inicia una técnica (cambia estado a EN_PROGRESO)
 * PATCH /api/tecnicas/:idTecnica/iniciar
 */
const iniciarTecnica = async (req, res, next) => {
    try {
        const { idTecnica } = req.params;
        const id = parseInt(idTecnica, 10);
        if (isNaN(id) || id <= 0) {
            res.status(400).json({
                success: false,
                message: 'ID de técnica inválido',
            });
            return;
        }
        const tecnica = await tecnicaService.iniciarTecnica(id);
        res.status(200).json({
            success: true,
            data: tecnica,
            message: 'Técnica iniciada correctamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.iniciarTecnica = iniciarTecnica;
/**
 * Completa una técnica (cambia estado a COMPLETADA)
 * PATCH /api/tecnicas/:idTecnica/completar
 */
const completarTecnica = async (req, res, next) => {
    try {
        const { idTecnica } = req.params;
        const { comentarios } = req.body;
        const id = parseInt(idTecnica, 10);
        if (isNaN(id) || id <= 0) {
            res.status(400).json({
                success: false,
                message: 'ID de técnica inválido',
            });
            return;
        }
        const tecnica = await tecnicaService.completarTecnica(id, comentarios);
        res.status(200).json({
            success: true,
            data: tecnica,
            message: 'Técnica completada correctamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.completarTecnica = completarTecnica;
/**
 * Obtiene técnicas pendientes para un proceso específico con información de muestra
 * GET /api/tecnicas/proceso/:idTecnicaProc/tecnicas
 */
const getTecnicasPendientesPorProceso = async (req, res, next) => {
    try {
        const { idTecnicaProc } = req.params;
        const id = parseInt(idTecnicaProc, 10);
        if (isNaN(id) || id <= 0) {
            res.status(400).json({
                success: false,
                message: 'ID de proceso de técnica inválido',
            });
            return;
        }
        const tecnicas = await tecnicaService.getTecnicasPendientesPorProceso(id);
        res.status(200).json({
            success: true,
            data: tecnicas,
            message: `Técnicas pendientes para proceso ${id} obtenidas correctamente`,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTecnicasPendientesPorProceso = getTecnicasPendientesPorProceso;
/**
 * Obtiene todas las técnicas con información de muestra
 * GET /api/tecnicas/con-muestra
 */
const getTecnicasConMuestra = async (req, res, next) => {
    try {
        const tecnicas = await tecnicaService.getTecnicasConMuestra();
        res.status(200).json({
            success: true,
            data: tecnicas,
            message: 'Técnicas con información de muestra obtenidas correctamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTecnicasConMuestra = getTecnicasConMuestra;
/**
 * Obtiene estadísticas del worklist calculadas en backend
 * GET /api/tecnicas/estadisticas
 */
const getEstadisticasWorklist = async (req, res, next) => {
    try {
        const stats = await tecnicaService.getWorklistStatsCalculadas();
        res.status(200).json({
            success: true,
            data: stats,
            message: 'Estadísticas del worklist obtenidas correctamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getEstadisticasWorklist = getEstadisticasWorklist;
const cambiarEstadoTecnica = async (req, res, next) => {
    const id_tecnica = Number(req.params.id);
    const { nuevoEstadoId, observaciones } = req.body;
    try {
        const { EstadoService } = await Promise.resolve().then(() => __importStar(require('../services/estado.service')));
        const estadoService = new EstadoService();
        const resultado = await estadoService.cambiarEstadoTecnica(id_tecnica, nuevoEstadoId, observaciones);
        res.status(200).json({
            success: true,
            message: 'Estado de técnica actualizado correctamente',
            data: resultado,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.cambiarEstadoTecnica = cambiarEstadoTecnica;
