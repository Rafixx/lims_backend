// src/models/DimPaciente.ts
import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class DimPaciente extends Model<
  InferAttributes<DimPaciente>,
  InferCreationAttributes<DimPaciente>
> {
  declare id: CreationOptional<number>;
  declare nombre?: string;
  declare sip?: string;
  declare direccion?: string;
  declare activo: CreationOptional<boolean>;
  declare created_by?: number;
  declare update_dt: CreationOptional<Date>;
  declare delete_dt?: Date;

  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        nombre: { type: DataTypes.STRING(50), allowNull: true },
        sip: { type: DataTypes.STRING(10), allowNull: true },
        direccion: { type: DataTypes.STRING(20), allowNull: true },
        activo: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        created_by: { type: DataTypes.INTEGER, allowNull: true },
        update_dt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        delete_dt: { type: DataTypes.DATE, allowNull: true },
      },
      {
        sequelize,
        tableName: 'dim_pacientes',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: false,
        updatedAt: 'update_dt',
        paranoid: true,
        deletedAt: 'delete_dt',
      }
    );
  }
}
