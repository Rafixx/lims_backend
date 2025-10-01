//src/models/DimCentro.ts
import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class DimEstado extends Model<
  InferAttributes<DimEstado>,
  InferCreationAttributes<DimEstado>
> {
  declare id: CreationOptional<number>;
  declare estado: string | null;
  declare entidad: string | null;
  declare descripcion?: string;
  declare orden?: number;
  declare activo?: boolean;
  declare color?: string; // Para UI
  declare es_inicial?: boolean;
  declare es_final?: boolean;

  static initModel(sequelize: Sequelize) {
    DimEstado.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        estado: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        entidad: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        descripcion: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        orden: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        activo: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        color: {
          type: DataTypes.STRING(7), // #FFFFFF
          allowNull: true,
        },
        es_inicial: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        es_final: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: 'dim_estados',
        schema: process.env.DB_SCHEMA,
        timestamps: false,
        // indexes: [
        //   {
        //     unique: true,
        //     fields: ['entidad', 'estado'],
        //   },
        // ],
      }
    );
  }
}
