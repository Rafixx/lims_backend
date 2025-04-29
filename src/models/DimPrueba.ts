// src/models/DimPrueba.ts
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

export class DimPrueba extends Model<
  InferAttributes<DimPrueba>,
  InferCreationAttributes<DimPrueba>
> {
  declare id: CreationOptional<number>;
  declare cod_prueba?: string;
  declare prueba: string;
  declare activa?: boolean;
  declare created_by?: number;
  declare update_dt?: Date;

  // Mixin para poder llamar a getSolicitudes()
  declare getSolicitudes: HasManyGetAssociationsMixin<Solicitud>;

  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        cod_prueba: {
          type: DataTypes.STRING(10),
          allowNull: true,
          defaultValue: null,
        },
        prueba: {
          type: DataTypes.STRING(50),
          allowNull: false,
          validate: {
            notNull: { msg: 'prueba es requerida' },
            notEmpty: { msg: 'prueba no puede estar vacía' },
          },
        },
        activa: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: true,
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        update_dt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'dim_pruebas',
        schema: process.env.DB_SCHEMA,
        timestamps: false,
      }
    );
  }

  static associate(models: Record<string, ModelStatic<Model>>) {
    // Un DimPrueba puede tener muchas Solicitudes
    this.hasMany(models.Solicitud, {
      foreignKey: 'id_prueba',
      as: 'solicitudes',
    });
  }
}
