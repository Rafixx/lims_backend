"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTecnicoLab = exports.deleteWorklist = exports.updateWorklist = exports.createWorklist = exports.getPosiblesTecnicas = exports.getPosiblesTecnicaProc = exports.getTecnicasById = exports.getWorklistById = exports.getWorklists = void 0;
const worklist_service_1 = require("../services/worklist.service");
const worklistService = new worklist_service_1.WorklistService();
const getWorklists = async (req, res, next) => {
    try {
        const worklists = await worklistService.getAllWorklists();
        res.status(200).json(worklists);
    }
    catch (error) {
        next(error);
    }
};
exports.getWorklists = getWorklists;
const getWorklistById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const worklist = await worklistService.getWorklistById(id);
        res.status(200).json(worklist);
    }
    catch (error) {
        next(error);
    }
};
exports.getWorklistById = getWorklistById;
const getTecnicasById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const worklist = await worklistService.getTecnicasById(id);
        res.status(200).json(worklist);
    }
    catch (error) {
        next(error);
    }
};
exports.getTecnicasById = getTecnicasById;
const getPosiblesTecnicaProc = async (req, res, next) => {
    try {
        const posiblesTecnicasProc = await worklistService.getPosiblesTecnicaProc();
        res.status(200).json(posiblesTecnicasProc);
    }
    catch (error) {
        next(error);
    }
};
exports.getPosiblesTecnicaProc = getPosiblesTecnicaProc;
const getPosiblesTecnicas = async (req, res, next) => {
    const tecnicaProc = req.params.tecnicaProc;
    console.log('tecnicaProc', tecnicaProc);
    try {
        const posiblesTecnicas = await worklistService.getPosiblesTecnicas(tecnicaProc);
        res.status(200).json(posiblesTecnicas);
    }
    catch (error) {
        next(error);
    }
};
exports.getPosiblesTecnicas = getPosiblesTecnicas;
const createWorklist = async (req, res, next) => {
    try {
        const nuevaWorklist = await worklistService.createWorklist(req.body);
        res.status(201).json(nuevaWorklist);
    }
    catch (error) {
        next(error);
    }
};
exports.createWorklist = createWorklist;
const updateWorklist = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const worklistActualizada = await worklistService.updateWorklist(id, req.body);
        res.status(200).json(worklistActualizada);
    }
    catch (error) {
        next(error);
    }
};
exports.updateWorklist = updateWorklist;
const deleteWorklist = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const resultado = await worklistService.deleteWorklist(id);
        res.status(200).json(resultado);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteWorklist = deleteWorklist;
const setTecnicoLab = async (req, res, next) => {
    const idWorklist = Number(req.params.id);
    const { id_tecnico } = req.body;
    if (!id_tecnico) {
        return res
            .status(400)
            .json({
            error: 'El id_tecnico es requerido en el cuerpo de la petición',
        });
    }
    try {
        const resultado = await worklistService.setTecnicoLab(idWorklist, Number(id_tecnico));
        res.status(200).json(resultado);
    }
    catch (error) {
        next(error);
    }
};
exports.setTecnicoLab = setTecnicoLab;
