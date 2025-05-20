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

export class DimMaquina extends Model<
  InferAttributes<DimMaquina>,
  InferCreationAttributes<DimMaquina>
> {
  declare id: CreationOptional<number>;
  declare codigo?: string;
  declare maquina: string;
  declare perfil_termico?: string;
  declare activa?: boolean;
  declare created_by?: number;
  declare update_dt?: Date;
  declare id_plantilla_tecnica?: number;

  declare plantilla_tecnica?: DimPlantillaTecnica;

  static initModel(sequelize: Sequelize) {
    DimMaquina.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        codigo: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        maquina: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notNull: { msg: 'El campo maquina es requerido' },
          },
        },
        perfil_termico: {
          type: DataTypes.STRING(255),
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
        tableName: 'dim_maquinas',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: false,
        updatedAt: 'update_dt',
        paranoid: false,
      }
    );
  }

  static associate(models: Record<string, ModelStatic<Model>>) {
    // cada máquina puede vincularse a una plantilla técnica
    DimMaquina.belongsTo(models.DimPlantillaTecnica, {
      foreignKey: 'id_plantilla_tecnica',
      as: 'plantilla_tecnica',
    });
  }
}
