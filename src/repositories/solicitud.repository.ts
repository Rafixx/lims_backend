import { Solicitud } from '../models/Solicitud';
import { DimCliente } from '../models/DimCliente';
import { DimPrueba } from '../models/DimPrueba';
import { CreationAttributes } from 'sequelize';
import { Muestra } from '../models/Muestra';
import { Usuario } from '../models/Usuario';
import { DimTipoMuestra } from '../models/DimTipoMuestra';
import { Tecnica } from '../models/Tecnica';
import { DimTecnicaProc } from '../models/DimTecnicaProc';

export class SolicitudRepository {
  async findById(id: number) {
    return Solicitud.findByPk(id, {
      include: [
        {
          model: Muestra,
          as: 'muestra',
          include: [
            {
              model: Tecnica,
              as: 'tecnicas',
              include: [
                {
                  model: DimTecnicaProc,
                  as: 'tecnica_proc',
                },
              ],
            },
            { model: DimPrueba, as: 'prueba', attributes: ['id', 'prueba'] },
          ],
        },
        { model: DimCliente, as: 'cliente', attributes: ['id', 'nombre'] },
      ],
    });
  }

  async findAll() {
    // return Solicitud.findAll();
    return Solicitud.findAll({
      include: [
        {
          model: Muestra,
          as: 'muestra',
          order: [['id_muestra', 'DESC']],
          // attributes: [],
          include: [
            {
              model: Usuario,
              as: 'tecnico_resp',
              // attributes: ['id_usuario', 'nombre', 'email'],
            },
            {
              model: DimTipoMuestra,
              as: 'tipo_muestra',
              // attributes: ['cod_tipo_muestra', 'tipo_muestra'],
            },
            {
              model: Tecnica,
              as: 'tecnicas',
              // attributes: [],
              include: [
                {
                  model: DimTecnicaProc,
                  as: 'tecnica_proc',
                  // attributes: [],
                },
              ],
            },
            { model: DimPrueba, as: 'prueba', attributes: ['id', 'prueba'] },
          ],
        },
        { model: DimCliente, as: 'cliente', attributes: ['id', 'nombre'] },
      ],
    });
  }

  async create(data: CreationAttributes<Solicitud>) {
    return Solicitud.create(data);
  }

  async update(solicitud: Solicitud, data: Partial<Solicitud>) {
    return solicitud.update(data);
  }

  async delete(solicitud: Solicitud) {
    return solicitud.destroy();
  }
}
