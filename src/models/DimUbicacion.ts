// src/models/DimUbicacion.ts
import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class DimUbicacion extends Model<
  InferAttributes<DimUbicacion>,
  InferCreationAttributes<DimUbicacion>
> {
  declare id: CreationOptional<number>;
  declare codigo?: string;
  declare ubicacion: string;
  declare activa?: boolean;
  declare created_by?: number;
  declare update_dt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        codigo: { type: DataTypes.STRING(20), allowNull: true },
        ubicacion: { type: DataTypes.STRING(100), allowNull: false },
        activa: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: true,
        },
        created_by: { type: DataTypes.INTEGER, allowNull: true },
        update_dt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'dim_ubicacion',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: false,
        updatedAt: 'update_dt',
      }
    );
  }
}
