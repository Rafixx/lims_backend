// src/models/Tecnica.ts

import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ModelStatic,
} from 'sequelize';
import { DimTecnicaProc } from './DimTecnicaProc';
import { Worklist } from './Worklist';
import { Usuario } from './Usuario';
import { DimEstado } from './DimEstado';
import { Resultado } from './Resultado';
import { Muestra } from './Muestra';
import { MuestraArray } from './MuestraArray';

export class Tecnica extends Model<
  InferAttributes<Tecnica>,
  InferCreationAttributes<Tecnica>
> {
  // ============== columnas ==============
  declare id_tecnica: CreationOptional<number>;
  declare id_muestra: number;
  declare id_array?: number;
  declare id_tecnica_proc: number;
  declare id_tecnico_resp?: number;
  declare id_worklist?: number;
  declare fecha_inicio_tec?: Date;
  declare estado?: string;
  declare id_estado?: number;

  declare fecha_estado?: Date;
  declare comentarios?: string;
  declare delete_dt?: Date | null; //añado |null por el workList.repository
  declare update_dt?: Date;
  declare created_by?: number;
  declare updated_by?: number;

  declare tecnica_proc?: DimTecnicaProc;

  // ============== inicialización ============
  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id_tecnica: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        id_muestra: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            notNull: { msg: 'id_muestra es requerido' },
          },
        },
        id_array: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'muestra_array',
            key: 'id_array',
          },
        },
        id_tecnica_proc: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            notNull: { msg: 'id_tecnica_proc es requerido' },
          },
        },
        id_tecnico_resp: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        id_worklist: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        fecha_inicio_tec: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        estado: {
          type: DataTypes.STRING(20),
          allowNull: true,
          defaultValue: 'CREADA',
        },
        id_estado: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'dim_estados',
            key: 'id',
          },
        },

        fecha_estado: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        comentarios: {
          type: DataTypes.STRING(255),
          allowNull: true,
          defaultValue: null,
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
        tableName: 'tecnicas',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: false,
        updatedAt: 'update_dt',
        paranoid: true,
        deletedAt: 'delete_dt',
        hooks: {
          beforeCreate: async (tecnica: Tecnica) => {
            // Si no se especifica estado, usar el inicial por defecto
            if (!tecnica.id_estado) {
              const estadoInicial = await DimEstado.findOne({
                where: {
                  entidad: 'TECNICA',
                  es_inicial: true,
                  activo: true,
                },
              });
              if (estadoInicial) {
                tecnica.id_estado = estadoInicial.id;
              }
            }
          },
        },
      }
    );
    this.addScope('withRefs', {
      attributes: [
        'id_tecnica',
        'id_muestra',
        'fecha_inicio_tec',
        'id_estado',
        'fecha_estado',
        'comentarios',
      ],
      include: [
        {
          model: DimEstado,
          as: 'estadoInfo',
          attributes: ['id', 'estado', 'color', 'descripcion'],
          where: { entidad: 'TECNICA' },
          required: false,
        },
        {
          model: DimTecnicaProc,
          as: 'tecnica_proc',
          attributes: ['id', 'tecnica_proc'],
        },
        {
          model: Worklist,
          as: 'worklist',
          attributes: ['id_worklist', 'nombre'],
        },
        {
          model: Muestra,
          as: 'muestra',
          attributes: ['id_muestra', 'codigo_epi', 'codigo_externo', 'estudio'],
        },
        {
          model: Usuario,
          as: 'tecnico_resp',
          attributes: ['id_usuario', 'nombre'],
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
    });
    this.addScope('externaliza', {
      attributes: [
        'id_tecnica',
        'id_muestra',
        'id_array',
        'fecha_inicio_tec',
        'id_estado',
        'fecha_estado',
        'comentarios',
      ],
      include: [
        {
          model: DimEstado,
          as: 'estadoInfo',
          attributes: ['id', 'estado', 'color', 'descripcion'],
          where: { entidad: 'TECNICA' },
          required: false,
        },
        {
          model: DimTecnicaProc,
          as: 'tecnica_proc',
          attributes: ['id', 'tecnica_proc'],
        },
        {
          model: Muestra,
          as: 'muestra',
          attributes: [
            'id_muestra',
            'codigo_epi',
            'codigo_externo',
            'estudio',
            'tipo_array',
          ],
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
            'num_array',
            'pos_array',
          ],
          required: false,
        },
      ],
    });
  }

  // ============== asociaciones ============
  static associate(models: Record<string, ModelStatic<Model>>) {
    // Técnica pertenece a una Muestra
    this.belongsTo(models.Muestra, {
      foreignKey: 'id_muestra',
      as: 'muestra',
    });
    // Técnica puede pertenecer a un MuestraArray (posición de array)
    this.belongsTo(models.MuestraArray, {
      foreignKey: 'id_array',
      as: 'muestraArray',
    });
    this.belongsTo(models.DimTecnicaProc, {
      foreignKey: 'id_tecnica_proc',
      as: 'tecnica_proc',
    });
    // Técnica pertenece a un Usuario (técnico responsable)
    this.belongsTo(models.Usuario, {
      foreignKey: 'id_tecnico_resp',
      as: 'tecnico_resp',
    });
    //Tecnica puede pertenecer a un Worklist
    this.belongsTo(models.Worklist, {
      foreignKey: 'id_worklist',
      as: 'worklist',
    });
    this.belongsTo(models.DimEstado, {
      foreignKey: 'id_estado',
      as: 'estadoInfo',
      scope: {
        entidad: 'TECNICA',
      },
    });
    this.hasMany(models.Resultado, {
      foreignKey: 'id_tecnica',
      as: 'resultados',
    });
    this.hasMany(models.TecnicaReactivo, {
      foreignKey: 'id_tecnica',
      as: 'tecnicasReactivos',
    });
  }
}
