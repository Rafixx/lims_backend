"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRol = exports.updateRol = exports.createRol = exports.getRolById = exports.getRoles = void 0;
const rol_service_1 = require("../services/rol.service");
const rolService = new rol_service_1.RolService();
const getRoles = async (req, res, next) => {
    try {
        const roles = await rolService.getAllRoles();
        res.status(200).json(roles);
    }
    catch (error) {
        next(error);
    }
};
exports.getRoles = getRoles;
const getRolById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const rol = await rolService.getRolById(id);
        res.status(200).json(rol);
    }
    catch (error) {
        next(error);
    }
};
exports.getRolById = getRolById;
const createRol = async (req, res, next) => {
    try {
        const nuevoRol = await rolService.createRol(req.body);
        res.status(201).json(nuevoRol);
    }
    catch (error) {
        next(error);
    }
};
exports.createRol = createRol;
const updateRol = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const rolActualizado = await rolService.updateRol(id, req.body);
        res.status(200).json(rolActualizado);
    }
    catch (error) {
        next(error);
    }
};
exports.updateRol = updateRol;
const deleteRol = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const result = await rolService.deleteRol(id);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteRol = deleteRol;
