// src/models/DimPlantillaTecnica.ts
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
import { DimTecnicaProc } from './DimTecnicaProc';

export class DimPlantillaTecnica extends Model<
  InferAttributes<DimPlantillaTecnica>,
  InferCreationAttributes<DimPlantillaTecnica>
> {
  declare id: CreationOptional<number>;
  declare cod_plantilla_tecnica: string;
  declare tecnica: string;
  declare activa?: boolean;
  declare created_by?: number;
  declare update_dt?: Date;

  // Mixin para la relación 1:n con DimTecnicaProc
  declare getDimTecnicasProc: HasManyGetAssociationsMixin<DimTecnicaProc>;

  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        cod_plantilla_tecnica: {
          type: DataTypes.STRING(50),
          allowNull: false,
          validate: {
            notNull: { msg: 'cod_plantilla_tecnica es requerido' },
            notEmpty: { msg: 'cod_plantilla_tecnica no puede estar vacío' },
          },
        },
        tecnica: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notNull: { msg: 'tecnica es requerida' },
            notEmpty: { msg: 'tecnica no puede estar vacía' },
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
        tableName: 'dim_plantilla_tecnica',
        schema: process.env.DB_SCHEMA,
        timestamps: false,
      }
    );
    return this;
  }

  static associate(models: Record<string, ModelStatic<Model>>) {
    // Una plantilla puede tener muchas técnicas de proceso
    this.hasMany(models.DimTecnicaProc, {
      foreignKey: 'id_plantilla_tecnica',
      as: 'dimTecnicasProc',
    });
    this.hasMany(models.DimPipeta, {
      foreignKey: 'id_plantilla_tecnica',
      as: 'dimPipetas',
    });
    this.hasMany(models.DimMaquina, {
      foreignKey: 'id_plantilla_tecnica',
      as: 'dimMaquinas',
    });
    this.hasMany(models.DimReactivo, {
      foreignKey: 'id_plantilla_tecnica',
      as: 'dimReactivos',
    });

    // Definir scope después de que las asociaciones estén configuradas
    this.addScope('withRefs', {
      include: [
        {
          model: models.DimTecnicaProc,
          as: 'dimTecnicasProc',
        },
        {
          model: models.DimPipeta,
          as: 'dimPipetas',
        },
        {
          model: models.DimMaquina,
          as: 'dimMaquinas',
        },
        {
          model: models.DimReactivo,
          as: 'dimReactivos',
        },
      ],
    });
  }
}
