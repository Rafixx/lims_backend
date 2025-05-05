// src/models/DimTipoMuestra.ts
import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  // ModelStatic,
} from 'sequelize';

export class DimTipoMuestra extends Model<
  InferAttributes<DimTipoMuestra>,
  InferCreationAttributes<DimTipoMuestra>
> {
  declare id: CreationOptional<number>;
  declare cod_tipo_muestra: string | null;
  declare tipo_muestra: string;
  declare created_by?: number;
  declare update_dt?: Date;

  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        cod_tipo_muestra: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        tipo_muestra: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        update_dt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'dim_tipo_muestra',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: false,
        updatedAt: 'update_dt',
      }
    );
  }

  // static associate(models: Record<string, ModelStatic<Model>>) {
  //   // Aquí puedes definir asociaciones si las hay en el futuro
  // }
}
