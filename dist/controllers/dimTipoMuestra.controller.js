"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTipoMuestra = exports.updateTipoMuestra = exports.createTipoMuestra = exports.getTipoMuestraById = exports.getTiposMuestra = void 0;
const dimTipoMuestra_service_1 = require("../services/dimTipoMuestra.service");
const service = new dimTipoMuestra_service_1.DimTipoMuestraService();
const getTiposMuestra = async (_, res) => {
    const tipos = await service.getAll();
    res.json(tipos);
};
exports.getTiposMuestra = getTiposMuestra;
const getTipoMuestraById = async (req, res) => {
    const tipo = await service.getById(Number(req.params.id));
    res.json(tipo);
};
exports.getTipoMuestraById = getTipoMuestraById;
const createTipoMuestra = async (req, res) => {
    const tipo = await service.create(req.body);
    res.status(201).json(tipo);
};
exports.createTipoMuestra = createTipoMuestra;
const updateTipoMuestra = async (req, res) => {
    const tipo = await service.update(Number(req.params.id), req.body);
    res.json(tipo);
};
exports.updateTipoMuestra = updateTipoMuestra;
const deleteTipoMuestra = async (req, res) => {
    await service.delete(Number(req.params.id));
    res.status(204).send();
};
exports.deleteTipoMuestra = deleteTipoMuestra;
