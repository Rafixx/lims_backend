import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ModelStatic,
} from 'sequelize';

export class DimCriterioValidacion extends Model<
  InferAttributes<DimCriterioValidacion>,
  InferCreationAttributes<DimCriterioValidacion>
> {
  declare id: CreationOptional<number>;
  declare codigo: string;
  declare descripcion: string;
  declare created_by?: number;
  declare update_dt?: Date;

  static initModel(sequelize: Sequelize) {
    DimCriterioValidacion.init(
      {
        id: {
          type: DataTypes.INTEGER,
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
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'dim_criterios_validacion',
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
    DimCriterioValidacion.hasMany(models.Muestra, {
      foreignKey: 'id_criterio_val',
      as: 'muestras',
    });
  }
}
