"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaciente = exports.updatePaciente = exports.createPaciente = exports.getPacienteById = exports.getPacientes = void 0;
const dimPaciente_service_1 = require("../services/dimPaciente.service");
const service = new dimPaciente_service_1.DimPacienteService();
const getPacientes = async (_, res) => {
    const data = await service.getAll();
    res.json(data);
};
exports.getPacientes = getPacientes;
const getPacienteById = async (req, res) => {
    const data = await service.getById(Number(req.params.id));
    res.json(data);
};
exports.getPacienteById = getPacienteById;
const createPaciente = async (req, res) => {
    const nuevo = await service.create(req.body);
    res.status(201).json(nuevo);
};
exports.createPaciente = createPaciente;
const updatePaciente = async (req, res) => {
    const actualizado = await service.update(Number(req.params.id), req.body);
    res.json(actualizado);
};
exports.updatePaciente = updatePaciente;
const deletePaciente = async (req, res) => {
    await service.delete(Number(req.params.id));
    res.status(204).send();
};
exports.deletePaciente = deletePaciente;
