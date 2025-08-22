//src/models/DimCentro.ts
import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ModelStatic,
} from 'sequelize';

export class DimCentro extends Model<
  InferAttributes<DimCentro>,
  InferCreationAttributes<DimCentro>
> {
  declare id: CreationOptional<number>;
  declare codigo: string | null;
  declare descripcion: string | null;
  declare created_by: number | null;
  declare update_dt: Date | null;

  static initModel(sequelize: Sequelize) {
    DimCentro.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        codigo: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        descripcion: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        update_dt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'dim_centros',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: false,
        updatedAt: 'update_dt',
        paranoid: false,
      }
    );
  }
  static associate(models: Record<string, ModelStatic<Model>>) {
    // each Centro puede asociarse con varias muestras
    DimCentro.hasMany(models.Muestra, {
      foreignKey: 'id_centro_externo',
      as: 'muestras',
    });
  }
}
