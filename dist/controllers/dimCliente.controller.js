"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCliente = exports.updateCliente = exports.createCliente = exports.getClienteById = exports.getClientes = void 0;
const dimCliente_service_1 = require("../services/dimCliente.service");
const dimClienteService = new dimCliente_service_1.DimClienteService();
const getClientes = async (req, res, next) => {
    try {
        const clientes = await dimClienteService.getAllClientes();
        res.status(200).json(clientes);
    }
    catch (error) {
        next(error);
    }
};
exports.getClientes = getClientes;
const getClienteById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const cliente = await dimClienteService.getClienteById(id);
        res.status(200).json(cliente);
    }
    catch (error) {
        next(error);
    }
};
exports.getClienteById = getClienteById;
const createCliente = async (req, res, next) => {
    try {
        const nuevoCliente = await dimClienteService.createCliente(req.body);
        res.status(201).json(nuevoCliente);
    }
    catch (error) {
        next(error);
    }
};
exports.createCliente = createCliente;
const updateCliente = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const clienteActualizado = await dimClienteService.updateCliente(id, req.body);
        res.status(200).json(clienteActualizado);
    }
    catch (error) {
        next(error);
    }
};
exports.updateCliente = updateCliente;
const deleteCliente = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const result = await dimClienteService.deleteCliente(id);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCliente = deleteCliente;
