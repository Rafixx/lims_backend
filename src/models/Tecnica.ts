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

export class Tecnica extends Model<
  InferAttributes<Tecnica>,
  InferCreationAttributes<Tecnica>
> {
  // ============== columnas ==============
  declare id_tecnica: CreationOptional<number>;
  declare id_muestra: number;
  declare id_tecnica_proc: number;
  declare id_tecnico_resp?: number;
  declare fecha_inicio_tec?: Date;
  declare estado?: string;
  declare fecha_estado?: Date;
  declare comentarios?: string;
  declare delete_dt?: Date | null; //añado |null por el workList.repository
  declare update_dt?: Date;
  declare created_by?: number;
  declare updated_by?: number;

  declare tecnica_proc?: DimTecnicaProc; // <-- esta línea es clave

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
        fecha_inicio_tec: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        estado: {
          type: DataTypes.STRING(20),
          allowNull: true,
          defaultValue: 'CREADA',
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
      }
    );
  }

  // ============== asociaciones ============
  static associate(models: Record<string, ModelStatic<Model>>) {
    // Técnica pertenece a una Muestra
    this.belongsTo(models.Muestra, {
      foreignKey: 'id_muestra',
      as: 'muestra',
    });
    this.belongsTo(models.DimTecnicaProc, {
      foreignKey: 'id_tecnica_proc',
      as: 'tecnica_proc',
    });
  }
}
