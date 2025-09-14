"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlantillaTecnica = exports.updatePlantillaTecnica = exports.createPlantillaTecnica = exports.getPlantillaTecnicaById = exports.getPlantillasTecnicas = void 0;
const dimPlantillaTecnica_service_1 = require("../services/dimPlantillaTecnica.service");
const dimPlantillaTecnicaService = new dimPlantillaTecnica_service_1.DimPlantillaTecnicaService();
const getPlantillasTecnicas = async (req, res, next) => {
    try {
        const plantillas = await dimPlantillaTecnicaService.getAllPlantillasTecnicas();
        res.status(200).json(plantillas);
    }
    catch (error) {
        next(error);
    }
};
exports.getPlantillasTecnicas = getPlantillasTecnicas;
const getPlantillaTecnicaById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const plantilla = await dimPlantillaTecnicaService.getPlantillaTecnicaById(id);
        res.status(200).json(plantilla);
    }
    catch (error) {
        next(error);
    }
};
exports.getPlantillaTecnicaById = getPlantillaTecnicaById;
const createPlantillaTecnica = async (req, res, next) => {
    try {
        const nuevaPlantilla = await dimPlantillaTecnicaService.createPlantillaTecnica(req.body);
        res.status(201).json(nuevaPlantilla);
    }
    catch (error) {
        next(error);
    }
};
exports.createPlantillaTecnica = createPlantillaTecnica;
const updatePlantillaTecnica = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const plantillaActualizada = await dimPlantillaTecnicaService.updatePlantillaTecnica(id, req.body);
        res.status(200).json(plantillaActualizada);
    }
    catch (error) {
        next(error);
    }
};
exports.updatePlantillaTecnica = updatePlantillaTecnica;
const deletePlantillaTecnica = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const result = await dimPlantillaTecnicaService.deletePlantillaTecnica(id);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.deletePlantillaTecnica = deletePlantillaTecnica;
