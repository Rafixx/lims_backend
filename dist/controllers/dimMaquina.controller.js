"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDimMaquina = exports.updateDimMaquina = exports.createDimMaquina = exports.getDimMaquinaById = exports.getDimMaquinas = void 0;
const dimMaquina_service_1 = require("../services/dimMaquina.service");
const dimMaquinaService = new dimMaquina_service_1.DimMaquinaService();
const getDimMaquinas = async (req, res, next) => {
    try {
        const maquinas = await dimMaquinaService.getAllDimMaquinas();
        res.status(200).json(maquinas);
    }
    catch (error) {
        next(error);
    }
};
exports.getDimMaquinas = getDimMaquinas;
const getDimMaquinaById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const maquina = await dimMaquinaService.getDimMaquinaById(id);
        res.status(200).json(maquina);
    }
    catch (error) {
        next(error);
    }
};
exports.getDimMaquinaById = getDimMaquinaById;
const createDimMaquina = async (req, res, next) => {
    try {
        const newMaquina = await dimMaquinaService.createDimMaquina(req.body);
        res.status(201).json(newMaquina);
    }
    catch (error) {
        next(error);
    }
};
exports.createDimMaquina = createDimMaquina;
const updateDimMaquina = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const updated = await dimMaquinaService.updateDimMaquina(id, req.body);
        res.status(200).json(updated);
    }
    catch (error) {
        next(error);
    }
};
exports.updateDimMaquina = updateDimMaquina;
const deleteDimMaquina = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        await dimMaquinaService.deleteDimMaquina(id);
        res.status(200).json({ message: 'Máquina eliminada correctamente' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDimMaquina = deleteDimMaquina;
