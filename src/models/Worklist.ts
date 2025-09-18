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

export class Worklist extends Model<
  InferAttributes<Worklist>,
  InferCreationAttributes<Worklist>
> {
  // ============== columnas ==============
  declare id_worklist: CreationOptional<number>;
  declare nombre?: string;
  declare id_tecnica_proc?: number;
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
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        id_tecnica_proc: {
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
  }

  // ============== asociaciones ============
  static associate(models: Record<string, ModelStatic<Model>>) {
    // Worklist tiene muchas Técnicas
    this.hasMany(models.Tecnica, {
      foreignKey: 'id_worklist',
      as: 'tecnicas',
    });
    this.belongsTo(models.DimTecnicaProc, {
      foreignKey: 'id_tecnica_proc',
      as: 'tecnica_proc',
    });
  }
}
