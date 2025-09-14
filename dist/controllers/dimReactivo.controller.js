"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDimReactivo = exports.updateDimReactivo = exports.createDimReactivo = exports.getDimReactivoById = exports.getDimReactivos = void 0;
const dimReactivo_service_1 = require("../services/dimReactivo.service");
const dimReactivoService = new dimReactivo_service_1.DimReactivoService();
const getDimReactivos = async (req, res, next) => {
    try {
        const reactivos = await dimReactivoService.getAllDimReactivos();
        res.status(200).json(reactivos);
    }
    catch (error) {
        next(error);
    }
};
exports.getDimReactivos = getDimReactivos;
const getDimReactivoById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const reactivo = await dimReactivoService.getDimReactivoById(id);
        res.status(200).json(reactivo);
    }
    catch (error) {
        next(error);
    }
};
exports.getDimReactivoById = getDimReactivoById;
const createDimReactivo = async (req, res, next) => {
    try {
        const newReactivo = await dimReactivoService.createDimReactivo(req.body);
        res.status(201).json(newReactivo);
    }
    catch (error) {
        next(error);
    }
};
exports.createDimReactivo = createDimReactivo;
const updateDimReactivo = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const updated = await dimReactivoService.updateDimReactivo(id, req.body);
        res.status(200).json(updated);
    }
    catch (error) {
        next(error);
    }
};
exports.updateDimReactivo = updateDimReactivo;
const deleteDimReactivo = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        await dimReactivoService.deleteDimReactivo(id);
        res.status(200).json({ message: 'Reactivo eliminado correctamente' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDimReactivo = deleteDimReactivo;
