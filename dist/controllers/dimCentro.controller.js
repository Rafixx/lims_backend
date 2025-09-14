"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDimCentro = exports.updateDimCentro = exports.createDimCentro = exports.getDimCentroById = exports.getDimCentros = void 0;
const dimCentro_service_1 = require("../services/dimCentro.service");
const dimCentroService = new dimCentro_service_1.DimCentroService();
const getDimCentros = async (req, res, next) => {
    try {
        const centros = await dimCentroService.getAllDimCentros();
        res.status(200).json(centros);
    }
    catch (error) {
        next(error);
    }
};
exports.getDimCentros = getDimCentros;
const getDimCentroById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const centro = await dimCentroService.getDimCentroById(id);
        res.status(200).json(centro);
    }
    catch (error) {
        next(error);
    }
};
exports.getDimCentroById = getDimCentroById;
const createDimCentro = async (req, res, next) => {
    try {
        const newCentro = await dimCentroService.createDimCentro(req.body);
        res.status(201).json(newCentro);
    }
    catch (error) {
        next(error);
    }
};
exports.createDimCentro = createDimCentro;
const updateDimCentro = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const updated = await dimCentroService.updateDimCentro(id, req.body);
        res.status(200).json(updated);
    }
    catch (error) {
        next(error);
    }
};
exports.updateDimCentro = updateDimCentro;
const deleteDimCentro = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        await dimCentroService.deleteDimCentro(id);
        res.status(200).json({ message: 'Centro eliminado correctamente' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDimCentro = deleteDimCentro;
