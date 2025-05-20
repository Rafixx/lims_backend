import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ModelStatic,
} from 'sequelize';
import { DimPlantillaTecnica } from './DimPlantillaTecnica';

export class DimPipeta extends Model<
  InferAttributes<DimPipeta>,
  InferCreationAttributes<DimPipeta>
> {
  declare id: CreationOptional<number>;
  declare codigo?: string;
  declare modelo: string;
  declare zona?: string;
  declare activa?: boolean;
  declare created_by?: number;
  declare update_dt?: Date;
  declare id_plantilla_tecnica?: number;

  declare plantilla_tecnica?: DimPlantillaTecnica;

  static initModel(sequelize: Sequelize) {
    DimPipeta.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        codigo: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        modelo: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notNull: { msg: 'El campo modelo es requerido' },
          },
        },
        zona: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        activa: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: true,
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
        id_plantilla_tecnica: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'dim_pipetas',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: false,
        updatedAt: 'update_dt',
        paranoid: false,
      }
    );
  }

  static associate(models: Record<string, ModelStatic<Model>>) {
    // each pipeta puede vincularse a una plantilla técnica
    DimPipeta.belongsTo(models.DimPlantillaTecnica, {
      foreignKey: 'id_plantilla_tecnica',
      as: 'plantilla_tecnica',
    });
  }
}
