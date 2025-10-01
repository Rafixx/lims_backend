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
exports.cambiarEstadoMuestra = exports.getMuestrasStats = exports.deleteMuestra = exports.updateMuestra = exports.createMuestra = exports.getTecnicasById = exports.getMuestraById = exports.getMuestras = void 0;
const muestra_service_1 = require("../services/muestra.service");
const muestraService = new muestra_service_1.MuestraService();
const getMuestras = async (req, res, next) => {
    try {
        const muestras = await muestraService.getAllMuestras();
        res.status(200).json(muestras);
    }
    catch (error) {
        next(error);
    }
};
exports.getMuestras = getMuestras;
const getMuestraById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const muestra = await muestraService.getMuestraById(id);
        res.status(200).json(muestra);
    }
    catch (error) {
        next(error);
    }
};
exports.getMuestraById = getMuestraById;
const getTecnicasById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const muestra = await muestraService.getTecnicasById(id);
        res.status(200).json(muestra);
    }
    catch (error) {
        next(error);
    }
};
exports.getTecnicasById = getTecnicasById;
const createMuestra = async (req, res, next) => {
    try {
        // Validación básica del cuerpo de la petición
        if (!req.body) {
            return res
                .status(400)
                .json({ error: 'El cuerpo de la petición es requerido' });
        }
        if (!req.body.solicitud) {
            return res
                .status(400)
                .json({ error: 'Los datos de la solicitud son requeridos' });
        }
        const nuevaMuestra = await muestraService.createMuestra(req.body);
        res.status(201).json(nuevaMuestra);
    }
    catch (error) {
        next(error);
    }
};
exports.createMuestra = createMuestra;
const updateMuestra = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const muestraActualizada = await muestraService.updateMuestra(id, req.body);
        res.status(200).json(muestraActualizada);
    }
    catch (error) {
        next(error);
    }
};
exports.updateMuestra = updateMuestra;
const deleteMuestra = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const result = await muestraService.deleteMuestra(id);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMuestra = deleteMuestra;
const getMuestrasStats = async (req, res, next) => {
    try {
        const stats = await muestraService.getMuestrasStats();
        res.status(200).json(stats);
    }
    catch (error) {
        next(error);
    }
};
exports.getMuestrasStats = getMuestrasStats;
const cambiarEstadoMuestra = async (req, res, next) => {
    const id_muestra = Number(req.params.id);
    const { nuevoEstadoId, observaciones } = req.body;
    try {
        const { EstadoService } = await Promise.resolve().then(() => __importStar(require('../services/estado.service')));
        const estadoService = new EstadoService();
        const resultado = await estadoService.cambiarEstadoMuestra(id_muestra, nuevoEstadoId, observaciones);
        res.status(200).json({
            success: true,
            message: 'Estado de muestra actualizado correctamente',
            data: resultado,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.cambiarEstadoMuestra = cambiarEstadoMuestra;
