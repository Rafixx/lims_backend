import { DimCliente } from '../models/DimCliente';

interface CreateDimClienteDTO {
  nombre: string;
  contacto?: string;
  email?: string;
  activo?: boolean;
}

export class DimClienteService {
  async createCliente(data: CreateDimClienteDTO) {
    const cliente = await DimCliente.create(data);
    return cliente;
  }

  async getClienteById(id: number) {
    const cliente = await DimCliente.findByPk(id);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }
    return cliente;
  }

  async getAllClientes() {
    return DimCliente.findAll();
  }

  async updateCliente(id: number, data: Partial<CreateDimClienteDTO>) {
    const cliente = await DimCliente.findByPk(id);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }
    await cliente.update(data);
    return cliente;
  }

  async deleteCliente(id: number) {
    const cliente = await DimCliente.findByPk(id);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }
    await cliente.destroy();
    return { message: 'Cliente eliminado correctamente' };
  }
}
