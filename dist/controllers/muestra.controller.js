"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMuestrasStats = exports.deleteMuestra = exports.updateMuestra = exports.createMuestra = exports.getTecnicasById = exports.getMuestraById = exports.getMuestras = void 0;
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
