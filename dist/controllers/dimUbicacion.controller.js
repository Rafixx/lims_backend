"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUbicacion = exports.updateUbicacion = exports.createUbicacion = exports.getUbicacionById = exports.getUbicaciones = void 0;
const dimUbicacion_service_1 = require("../services/dimUbicacion.service");
const service = new dimUbicacion_service_1.DimUbicacionService();
const getUbicaciones = async (_, res) => {
    const data = await service.getAll();
    res.json(data);
};
exports.getUbicaciones = getUbicaciones;
const getUbicacionById = async (req, res) => {
    const data = await service.getById(Number(req.params.id));
    res.json(data);
};
exports.getUbicacionById = getUbicacionById;
const createUbicacion = async (req, res) => {
    const nueva = await service.create(req.body);
    res.status(201).json(nueva);
};
exports.createUbicacion = createUbicacion;
const updateUbicacion = async (req, res) => {
    const actualizada = await service.update(Number(req.params.id), req.body);
    res.json(actualizada);
};
exports.updateUbicacion = updateUbicacion;
const deleteUbicacion = async (req, res) => {
    await service.delete(Number(req.params.id));
    res.status(204).send();
};
exports.deleteUbicacion = deleteUbicacion;
