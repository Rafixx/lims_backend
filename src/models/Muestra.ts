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

export class Muestra extends Model<
  InferAttributes<Muestra>,
  InferCreationAttributes<Muestra>
> {
  declare id_muestra: CreationOptional<number>;
  declare id_paciente?: number;
  declare id_solicitud: number;
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
  }

  static associate(models: Record<string, ModelStatic<Model>>) {
    this.belongsTo(models.Solicitud, {
      foreignKey: 'id_solicitud',
      as: 'solicitud',
    });
    // this.hasMany(models.Tecnica, {
    //   foreignKey: 'id_muestra',
    //   as: 'tecnicas',
    // });
    // …otras relaciones
  }
}
