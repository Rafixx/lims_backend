"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePrueba = exports.updatePrueba = exports.createPrueba = exports.getTecnicasByPrueba = exports.getPruebaById = exports.getPruebas = void 0;
const dimPrueba_service_1 = require("../services/dimPrueba.service");
const dimPruebaService = new dimPrueba_service_1.DimPruebaService();
const getPruebas = async (req, res, next) => {
    try {
        const pruebas = await dimPruebaService.getAllPruebas();
        res.status(200).json(pruebas);
    }
    catch (error) {
        next(error);
    }
};
exports.getPruebas = getPruebas;
const getPruebaById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const prueba = await dimPruebaService.getPruebaById(id);
        res.status(200).json(prueba);
    }
    catch (error) {
        next(error);
    }
};
exports.getPruebaById = getPruebaById;
const getTecnicasByPrueba = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const tecnicas = await dimPruebaService.getTecnicasByPrueba(id);
        res.status(200).json(tecnicas);
    }
    catch (error) {
        next(error);
    }
};
exports.getTecnicasByPrueba = getTecnicasByPrueba;
const createPrueba = async (req, res, next) => {
    try {
        const nuevaPrueba = await dimPruebaService.createPrueba(req.body);
        res.status(201).json(nuevaPrueba);
    }
    catch (error) {
        next(error);
    }
};
exports.createPrueba = createPrueba;
const updatePrueba = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const pruebaActualizada = await dimPruebaService.updatePrueba(id, req.body);
        res.status(200).json(pruebaActualizada);
    }
    catch (error) {
        next(error);
    }
};
exports.updatePrueba = updatePrueba;
const deletePrueba = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const result = await dimPruebaService.deletePrueba(id);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.deletePrueba = deletePrueba;
