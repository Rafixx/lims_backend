"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUsuario = exports.updateUsuario = exports.createUsuario = exports.getUsuarioById = exports.getUsuarios = void 0;
const usuario_service_1 = require("../services/usuario.service");
const usuarioService = new usuario_service_1.UsuarioService();
const getUsuarios = async (req, res, next) => {
    try {
        const usuarios = await usuarioService.getAllUsuarios();
        res.status(200).json(usuarios);
    }
    catch (error) {
        next(error);
    }
};
exports.getUsuarios = getUsuarios;
const getUsuarioById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const usuario = await usuarioService.getUsuarioById(id);
        res.status(200).json(usuario);
    }
    catch (error) {
        next(error);
    }
};
exports.getUsuarioById = getUsuarioById;
const createUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.createUsuario(req.body);
        return res.status(201).json(usuario);
    }
    catch (error) {
        console.error('[CreateUsuario Controller Error]', error);
        if (error instanceof Error &&
            error.message.includes('email ya está en uso')) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};
exports.createUsuario = createUsuario;
const updateUsuario = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const usuarioActualizado = await usuarioService.updateUsuario(id, req.body);
        res.status(200).json(usuarioActualizado);
    }
    catch (error) {
        next(error);
    }
};
exports.updateUsuario = updateUsuario;
const deleteUsuario = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const result = await usuarioService.deleteUsuario(id);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUsuario = deleteUsuario;
