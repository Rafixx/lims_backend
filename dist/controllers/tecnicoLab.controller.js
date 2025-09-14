"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTecnicoLab = void 0;
const tecnicoLab_service_1 = require("../services/tecnicoLab.service");
const tecnicoLabService = new tecnicoLab_service_1.TecnicoLabService();
const getAllTecnicoLab = async (req, res, next) => {
    try {
        const tecnicos = await tecnicoLabService.getAllTecnicoLabService();
        res.json(tecnicos);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllTecnicoLab = getAllTecnicoLab;
