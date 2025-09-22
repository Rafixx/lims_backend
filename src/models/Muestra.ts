// src/models/Muestra.ts
import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ModelStatic,
  HasManyGetAssociationsMixin,
} from 'sequelize';
import { Solicitud } from './Solicitud';
import { Tecnica } from './Tecnica';
import { DimPaciente } from './DimPaciente';
import { Usuario } from './Usuario';
import { DimTipoMuestra } from './DimTipoMuestra';
import { DimCentro } from './DimCentro';
import { DimCriterioValidacion } from './DimCriterioValidacion';
import { DimUbicacion } from './DimUbicacion';
import { DimCliente } from './DimCliente';
import { DimPrueba } from './DimPrueba';

export class Muestra extends Model<
  InferAttributes<Muestra>,
  InferCreationAttributes<Muestra>
> {
  declare id_muestra: CreationOptional<number>;
  declare id_paciente?: number;
  declare id_solicitud: number;
  declare id_prueba?: number;
  declare id_tecnico_resp?: CreationOptional<number>;
  declare id_tipo_muestra?: CreationOptional<number>;
  declare id_centro_externo?: CreationOptional<number>;
  declare id_criterio_val?: CreationOptional<number>;
  declare id_ubicacion?: CreationOptional<number>;
  declare tipo_array?: CreationOptional<boolean>;
  declare codigo_epi?: CreationOptional<string>;
  declare codigo_externo?: CreationOptional<string>;
  declare f_toma?: CreationOptional<Date>;
  declare f_recepcion?: CreationOptional<Date>;
  declare f_destruccion?: CreationOptional<Date>;
  declare f_devolucion?: CreationOptional<Date>;
  declare agotada?: CreationOptional<boolean>;
  declare estado_muestra?: CreationOptional<string>;
  declare delete_dt?: CreationOptional<Date>;
  declare update_dt: CreationOptional<Date>;
  declare created_by?: CreationOptional<number>;
  declare updated_by?: CreationOptional<number>;

  declare getSolicitud: () => Promise<Solicitud>;
  declare getTecnicas: HasManyGetAssociationsMixin<Tecnica>;

  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id_muestra: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        id_paciente: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        id_solicitud: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            notNull: { msg: 'id_solicitud es requerido' },
            isInt: { msg: 'id_solicitud debe ser numérico' },
          },
        },
        id_prueba: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        id_tecnico_resp: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        id_tipo_muestra: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        id_centro_externo: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        id_criterio_val: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        id_ubicacion: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        tipo_array: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: null,
        },
        codigo_epi: {
          type: DataTypes.STRING(50),
          allowNull: true,
          defaultValue: null,
        },
        codigo_externo: {
          type: DataTypes.STRING(50),
          allowNull: true,
          defaultValue: null,
        },
        f_toma: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
        f_recepcion: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
        f_destruccion: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
        f_devolucion: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
        agotada: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
        estado_muestra: {
          type: DataTypes.STRING(20),
          allowNull: true,
          defaultValue: 'CREADA',
        },
        update_dt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        delete_dt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        updated_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        tableName: 'muestra',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: false,
        updatedAt: 'update_dt',
        paranoid: true,
        deletedAt: 'delete_dt',
      }
    );
    this.addScope('withRefs', {
      attributes: [
        'id_muestra',
        'codigo_epi',
        'codigo_externo',
        'f_toma',
        'f_recepcion',
        'f_destruccion',
        'f_devolucion',
        'estado_muestra',
      ],
      include: [
        {
          model: DimPaciente,
          as: 'paciente',
          attributes: ['id', 'nombre', 'sip', 'direccion'],
        },
        {
          model: Solicitud,
          include: [
            {
              model: DimCliente,
              as: 'cliente',
              attributes: ['id', 'nombre', 'razon_social', 'nif'],
            },
          ],
          foreignKey: 'id_solicitud',
          as: 'solicitud',
          attributes: [
            'id_solicitud',
            'id_cliente',
            'f_creacion',
            'f_entrada',
            'f_compromiso',
            'f_entrega',
            'f_resultado',
            'condiciones_envio',
            'tiempo_hielo',
          ],
        },
        {
          model: Usuario,
          as: 'tecnico_resp',
          attributes: ['id_usuario', 'nombre', 'email'],
        },
        {
          model: DimTipoMuestra,
          as: 'tipo_muestra',
          attributes: ['id', 'cod_tipo_muestra', 'tipo_muestra'],
        },
        {
          model: DimCentro,
          as: 'centro',
          attributes: ['id', 'codigo', 'descripcion'],
        },
        {
          model: DimCriterioValidacion,
          as: 'criterio_validacion',
          attributes: ['id', 'codigo', 'descripcion'],
        },
        {
          model: DimUbicacion,
          as: 'ubicacion',
          attributes: ['id', 'codigo', 'ubicacion'],
        },
        {
          model: DimPrueba,
          as: 'prueba',
          attributes: ['id', 'cod_prueba', 'prueba'],
        },
      ],
    });
  }

  static associate(models: Record<string, ModelStatic<Model>>) {
    this.hasMany(models.Tecnica, {
      foreignKey: 'id_muestra',
      as: 'tecnicas',
    });
    this.belongsTo(models.Usuario, {
      foreignKey: 'id_tecnico_resp',
      as: 'tecnico_resp',
    });
    this.belongsTo(models.DimTipoMuestra, {
      foreignKey: 'id_tipo_muestra',
      as: 'tipo_muestra',
    });
    this.belongsTo(models.DimPaciente, {
      foreignKey: 'id_paciente',
      as: 'paciente',
    });
    this.belongsTo(models.DimPrueba, {
      foreignKey: 'id_prueba',
      as: 'prueba',
    });
    this.belongsTo(models.DimCentro, {
      foreignKey: 'id_centro_externo',
      as: 'centro',
    });
    this.belongsTo(models.Solicitud, {
      foreignKey: 'id_solicitud',
      as: 'solicitud',
    });
    this.belongsTo(models.DimCriterioValidacion, {
      foreignKey: 'id_criterio_val',
      as: 'criterio_validacion',
    });
    this.belongsTo(models.DimUbicacion, {
      foreignKey: 'id_ubicacion',
      as: 'ubicacion',
    });
  }
}
