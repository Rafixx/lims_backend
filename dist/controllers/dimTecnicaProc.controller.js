"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTecnicaProc = exports.updateTecnicaProc = exports.createTecnicaProc = exports.getTecnicaProcById = exports.getTecnicasProc = void 0;
const dimTecnicaProc_service_1 = require("../services/dimTecnicaProc.service");
const dimTecnicaProcService = new dimTecnicaProc_service_1.DimTecnicaProcService();
const getTecnicasProc = async (req, res, next) => {
    try {
        const tecnicasProc = await dimTecnicaProcService.getAllTecnicasProc();
        res.status(200).json(tecnicasProc);
    }
    catch (error) {
        next(error);
    }
};
exports.getTecnicasProc = getTecnicasProc;
const getTecnicaProcById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const tecnicaProc = await dimTecnicaProcService.getTecnicaProcById(id);
        res.status(200).json(tecnicaProc);
    }
    catch (error) {
        next(error);
    }
};
exports.getTecnicaProcById = getTecnicaProcById;
const createTecnicaProc = async (req, res, next) => {
    try {
        const nuevaTecnicaProc = await dimTecnicaProcService.createTecnicaProc(req.body);
        res.status(201).json(nuevaTecnicaProc);
    }
    catch (error) {
        next(error);
    }
};
exports.createTecnicaProc = createTecnicaProc;
const updateTecnicaProc = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const tecnicaProcActualizada = await dimTecnicaProcService.updateTecnicaProc(id, req.body);
        res.status(200).json(tecnicaProcActualizada);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTecnicaProc = updateTecnicaProc;
const deleteTecnicaProc = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const result = await dimTecnicaProcService.deleteTecnicaProc(id);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTecnicaProc = deleteTecnicaProc;
