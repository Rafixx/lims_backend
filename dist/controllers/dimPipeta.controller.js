"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDimPipeta = exports.updateDimPipeta = exports.createDimPipeta = exports.getDimPipetaById = exports.getDimPipetas = void 0;
const dimPipeta_service_1 = require("../services/dimPipeta.service");
const dimPipetasService = new dimPipeta_service_1.DimPipetaService();
const getDimPipetas = async (req, res, next) => {
    try {
        const pipetas = await dimPipetasService.getAllDimPipetas();
        res.status(200).json(pipetas);
    }
    catch (error) {
        next(error);
    }
};
exports.getDimPipetas = getDimPipetas;
const getDimPipetaById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const pipeta = await dimPipetasService.getDimPipetaById(id);
        res.status(200).json(pipeta);
    }
    catch (error) {
        next(error);
    }
};
exports.getDimPipetaById = getDimPipetaById;
const createDimPipeta = async (req, res, next) => {
    try {
        const newPipeta = await dimPipetasService.createDimPipeta(req.body);
        res.status(201).json(newPipeta);
    }
    catch (error) {
        next(error);
    }
};
exports.createDimPipeta = createDimPipeta;
const updateDimPipeta = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const updated = await dimPipetasService.updateDimPipeta(id, req.body);
        res.status(200).json(updated);
    }
    catch (error) {
        next(error);
    }
};
exports.updateDimPipeta = updateDimPipeta;
const deleteDimPipeta = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        await dimPipetasService.deleteDimPipeta(id);
        res.status(200).json({ message: 'Pipeta eliminada correctamente' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDimPipeta = deleteDimPipeta;
