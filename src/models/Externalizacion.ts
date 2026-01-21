// src/models/Externalizacion.ts

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
import { DimCentro } from './DimCentro';
import { Usuario } from './Usuario';

export class Externalizacion extends Model<
  InferAttributes<Externalizacion>,
  InferCreationAttributes<Externalizacion>
> {
  // ============== columnas ==============
  declare id_externalizacion: CreationOptional<number>;
  declare id_tecnica: number;
  declare volumen?: string;
  declare concentracion?: string;
  declare id_centro?: number;
  declare servicio?: string;
  declare f_envio?: Date;
  declare f_recepcion?: Date;
  declare f_recepcion_datos?: Date;
  declare agencia?: string;
  declare id_tecnico_resp?: number;
  declare observaciones?: string;
  declare created_by?: number;
  declare updated_by?: number;
  declare update_dt?: Date;
  declare delete_dt?: Date | null;

  // ============== inicialización ============
  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id_externalizacion: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        id_tecnica: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'tecnicas',
            key: 'id_tecnica',
          },
          validate: {
            notNull: { msg: 'id_tecnica es requerido' },
          },
        },
        volumen: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        concentracion: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        id_centro: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'dim_centro',
            key: 'id',
          },
        },
        servicio: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        f_envio: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        f_recepcion: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        f_recepcion_datos: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        agencia: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        id_tecnico_resp: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'usuario',
            key: 'id_usuario',
          },
        },
        observaciones: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        updated_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
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
      },
      {
        sequelize,
        tableName: 'externalizacion',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: false,
        updatedAt: 'update_dt',
        paranoid: true,
        deletedAt: 'delete_dt',
      }
    );

    // Scope con referencias completas
    this.addScope('withRefs', {
      attributes: [
        'id_externalizacion',
        'id_tecnica',
        'volumen',
        'concentracion',
        'servicio',
        'f_envio',
        'f_recepcion',
        'f_recepcion_datos',
        'agencia',
        'observaciones',
      ],
      include: [
        {
          model: Tecnica.scope('externaliza'),
          as: 'tecnica',
        },
        {
          model: DimCentro,
          as: 'centro',
          attributes: ['id', 'codigo', 'descripcion'],
          required: false,
        },
        {
          model: Usuario,
          as: 'tecnico_resp',
          attributes: ['id_usuario', 'nombre'],
          required: false,
        },
      ],
    });
  }

  // ============== asociaciones ============
  static associate(models: Record<string, ModelStatic<Model>>) {
    // Externalizacion pertenece a una Tecnica
    this.belongsTo(models.Tecnica, {
      foreignKey: 'id_tecnica',
      as: 'tecnica',
    });

    // Externalizacion puede pertenecer a un Centro
    this.belongsTo(models.DimCentro, {
      foreignKey: 'id_centro',
      as: 'centro',
    });

    // Externalizacion puede tener un técnico responsable
    this.belongsTo(models.Usuario, {
      foreignKey: 'id_tecnico_resp',
      as: 'tecnico_resp',
    });
  }
}
