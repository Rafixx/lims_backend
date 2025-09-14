"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimClienteService = void 0;
const DimCliente_1 = require("../models/DimCliente");
class DimClienteService {
    async createCliente(data) {
        const cliente = await DimCliente_1.DimCliente.create(data);
        return cliente;
    }
    async getClienteById(id) {
        const cliente = await DimCliente_1.DimCliente.findByPk(id);
        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }
        return cliente;
    }
    async getAllClientes() {
        return DimCliente_1.DimCliente.findAll();
    }
    async updateCliente(id, data) {
        const cliente = await DimCliente_1.DimCliente.findByPk(id);
        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }
        await cliente.update(data);
        return cliente;
    }
    async deleteCliente(id) {
        const cliente = await DimCliente_1.DimCliente.findByPk(id);
        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }
        await cliente.destroy();
        return { message: 'Cliente eliminado correctamente' };
    }
}
exports.DimClienteService = DimClienteService;
