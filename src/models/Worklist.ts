// src/models/Worklist.ts

import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ModelStatic,
} from 'sequelize';
import { Tecnica } from './Tecnica';
import { Muestra } from './Muestra';
import { Usuario } from './Usuario';
import { Resultado } from './Resultado';
import { DimEstado } from './DimEstado';
import { MuestraArray } from './MuestraArray';

export class Worklist extends Model<
  InferAttributes<Worklist>,
  InferCreationAttributes<Worklist>
> {
  // ============== columnas ==============
  declare id_worklist: CreationOptional<number>;
  declare nombre?: string;
  declare tecnica_proc?: string;
  declare id_tecnico_resp?: number;
  declare create_dt?: Date | null;
  declare delete_dt?: Date | null;
  declare update_dt?: Date;
  declare created_by?: number;
  declare updated_by?: number;

  // ============== inicialización ============
  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id_worklist: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        nombre: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        tecnica_proc: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        id_tecnico_resp: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        create_dt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        delete_dt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        update_dt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        updated_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'worklist',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: 'create_dt',
        updatedAt: 'update_dt',
        paranoid: true,
        deletedAt: 'delete_dt',
      }
    );
    this.addScope('withRefs', {
      include: [
        {
          model: Tecnica,
          include: [
            {
              model: DimEstado,
              as: 'estadoInfo',
              attributes: ['id', 'estado', 'color', 'descripcion'],
              where: { entidad: 'TECNICA' },
              required: false,
            },
            {
              model: Muestra,
              as: 'muestra',
              attributes: ['codigo_epi', 'codigo_externo'],
            },
            {
              model: MuestraArray,
              as: 'muestraArray',
              attributes: [
                'id_array',
                'id_muestra',
                'codigo_placa',
                'posicion_placa',
                'codigo_epi',
                'codigo_externo',
              ],
            },
            {
              model: Usuario,
              as: 'tecnico_resp',
              attributes: ['nombre'],
            },
            {
              model: Resultado,
              as: 'resultados',
              attributes: [
                'id_resultado',
                'tipo_res',
                'valor',
                'valor_texto',
                'valor_fecha',
                'unidades',
              ],
            },
          ],
          as: 'tecnicas',
        },
      ],
    });
  }

  // ============== asociaciones ============
  static associate(models: Record<string, ModelStatic<Model>>) {
    // Worklist tiene muchas Técnicas
    this.hasMany(models.Tecnica, {
      foreignKey: 'id_worklist',
      as: 'tecnicas',
    });
  }
}
