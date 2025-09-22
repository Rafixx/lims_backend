// import { Op, fn, col, WhereOptions } from 'sequelize';
import { Worklist } from '../models/Worklist';
import { Tecnica } from '../models/Tecnica';
// import { DimTecnicaProc } from '../models/DimTecnicaProc';
// import { Muestra } from '../models/Muestra';
// import { DimTipoMuestra } from '../models/DimTipoMuestra';
// import { Usuario } from '../models/Usuario';
// import { DimPaciente } from '../models/DimPaciente';

export class WorklistRepository {
  async findById(id: number) {
    return Worklist.scope('withRefs').findByPk(id);
  }

  async findAll() {
    return Worklist.scope('withRefs').findAll();
  }

  async findTecnicasById(id_worklist: number) {
    return Tecnica.scope('withRefs').findAll({
      where: { id_worklist },
    });
  }

  async create(data: Partial<Worklist>) {
    return Worklist.create(data);
  }

  async update(worklist: Worklist, data: Partial<Worklist>) {
    return worklist.update(data);
  }

  async delete(worklist: Worklist) {
    return worklist.destroy();
  }
}
