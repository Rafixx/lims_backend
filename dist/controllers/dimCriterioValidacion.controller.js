"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDimCriterioValidacion = exports.updateDimCriterioValidacion = exports.createDimCriterioValidacion = exports.getDimCriterioValidacionById = exports.getDimCriterioValidaciones = void 0;
const dimCriterioValidacion_service_1 = require("../services/dimCriterioValidacion.service");
const dimCriterioValidacionService = new dimCriterioValidacion_service_1.DimCriterioValidacionService();
const getDimCriterioValidaciones = async (req, res, next) => {
    try {
        const criterios = await dimCriterioValidacionService.getAllDimCriteriosValidacion();
        res.status(200).json(criterios);
    }
    catch (error) {
        next(error);
    }
};
exports.getDimCriterioValidaciones = getDimCriterioValidaciones;
const getDimCriterioValidacionById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const criterio = await dimCriterioValidacionService.getDimCriterioValidacionById(id);
        res.status(200).json(criterio);
    }
    catch (error) {
        next(error);
    }
};
exports.getDimCriterioValidacionById = getDimCriterioValidacionById;
const createDimCriterioValidacion = async (req, res, next) => {
    try {
        const newCriterio = await dimCriterioValidacionService.createDimCriterioValidacion(req.body);
        res.status(201).json(newCriterio);
    }
    catch (error) {
        next(error);
    }
};
exports.createDimCriterioValidacion = createDimCriterioValidacion;
const updateDimCriterioValidacion = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const updated = await dimCriterioValidacionService.updateDimCriterioValidacion(id, req.body);
        res.status(200).json(updated);
    }
    catch (error) {
        next(error);
    }
};
exports.updateDimCriterioValidacion = updateDimCriterioValidacion;
const deleteDimCriterioValidacion = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        await dimCriterioValidacionService.deleteDimCriterioValidacion(id);
        res
            .status(200)
            .json({ message: 'Criterio de validación eliminado correctamente' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDimCriterioValidacion = deleteDimCriterioValidacion;
