// src/services/dimPaciente.service.ts
import { DimPaciente } from '../models/DimPaciente';

interface CreatePacienteDTO {
  nombre?: string;
  sip?: string;
  direccion?: string;
  activo: boolean;
  created_by?: number;
}

export class DimPacienteService {
  async getAll() {
    return DimPaciente.findAll();
  }

  async getById(id: number) {
    const paciente = await DimPaciente.findByPk(id);
    if (!paciente) throw new Error('Paciente no encontrado');
    return paciente;
  }

  async create(data: CreatePacienteDTO) {
    return DimPaciente.create(data);
  }

  async update(id: number, data: Partial<CreatePacienteDTO>) {
    const paciente = await this.getById(id);
    return paciente.update(data);
  }

  async delete(id: number) {
    const paciente = await this.getById(id);
    return paciente.destroy();
  }
}
