// src/services/dimTipoMuestra.service.ts
import { DimTipoMuestraRepository } from '../repositories/dimTipoMuestra.repository';

interface CreateTipoMuestraDTO {
  cod_tipo_muestra?: string;
  tipo_muestra: string;
  created_by?: number;
}

export class DimTipoMuestraService {
  constructor(private readonly repo = new DimTipoMuestraRepository()) {}

  async getAll() {
    return this.repo.findAll();
  }

  async getById(id: number) {
    const tipo = await this.repo.findById(id);
    if (!tipo) {
      throw new Error('Tipo de muestra no encontrado');
    }
    return tipo;
  }

  async create(data: CreateTipoMuestraDTO) {
    return this.repo.create(data);
  }

  async update(id: number, data: Partial<CreateTipoMuestraDTO>) {
    const tipo = await this.repo.findById(id);
    if (!tipo) {
      throw new Error('Tipo de muestra no encontrado');
    }
    return this.repo.update(tipo, data);
  }

  async delete(id: number) {
    const tipo = await this.repo.findById(id);
    if (!tipo) {
      throw new Error('Tipo de muestra no encontrado');
    }
    return this.repo.delete(tipo);
  }
}
