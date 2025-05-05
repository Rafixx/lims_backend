// src/repositories/dimTipoMuestra.repository.ts
import { DimTipoMuestra } from '../models/DimTipoMuestra';
import { CreationAttributes } from 'sequelize';

export class DimTipoMuestraRepository {
  async findAll() {
    return DimTipoMuestra.findAll({ order: [['tipo_muestra', 'ASC']] });
  }

  async findById(id: number) {
    return DimTipoMuestra.findByPk(id);
  }

  async create(data: CreationAttributes<DimTipoMuestra>) {
    return DimTipoMuestra.create(data);
  }

  async update(tipoMuestra: DimTipoMuestra, data: Partial<DimTipoMuestra>) {
    return tipoMuestra.update(data);
  }

  async delete(tipoMuestra: DimTipoMuestra) {
    return tipoMuestra.destroy();
  }
}
