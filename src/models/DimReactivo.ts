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

export class DimReactivo extends Model<
  InferAttributes<DimReactivo>,
  InferCreationAttributes<DimReactivo>
> {
  declare id: CreationOptional<number>;
  declare num_referencia?: string;
  declare reactivo: string;
  declare lote?: string;
  declare volumen_formula?: string;
  declare activa?: boolean;
  declare created_by?: number;
  declare update_dt?: Date;
  declare id_plantilla_tecnica?: number;

  declare plantilla_tecnica?: DimPlantillaTecnica;

  static initModel(sequelize: Sequelize) {
    DimReactivo.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        num_referencia: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        reactivo: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notNull: { msg: 'El campo reactivo es requerido' },
          },
        },
        lote: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        volumen_formula: {
          type: DataTypes.STRING(20),
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
        tableName: 'dim_reactivos',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: false,
        updatedAt: 'update_dt',
        paranoid: false,
      }
    );
  }

  static associate(models: Record<string, ModelStatic<Model>>) {
    // cada reactivo puede vincularse a una plantilla técnica
    DimReactivo.belongsTo(models.DimPlantillaTecnica, {
      foreignKey: 'id_plantilla_tecnica',
      as: 'plantilla_tecnica',
    });
  }
}
