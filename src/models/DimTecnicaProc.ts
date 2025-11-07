// src/models/DimTecnicaProc.ts
import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ModelStatic,
  BelongsToGetAssociationMixin,
} from 'sequelize';
import { DimPrueba } from './DimPrueba';
import { DimPlantillaTecnica } from './DimPlantillaTecnica';
import { DimPipeta } from './DimPipeta';
import { DimReactivo } from './DimReactivo';
import { DimMaquina } from './DimMaquina';
import { DimPlantillaPasos } from './DimPlantillaPasos';

export class DimTecnicaProc extends Model<
  InferAttributes<DimTecnicaProc>,
  InferCreationAttributes<DimTecnicaProc>
> {
  declare id: CreationOptional<number>;
  declare tecnica_proc: string;
  declare orden?: number;
  declare obligatoria?: boolean;
  declare activa?: boolean;
  declare created_by?: number;
  declare update_dt?: Date;
  declare id_prueba?: number;
  declare id_plantilla_tecnica?: number;

  // Mixins para acceder a las relaciones
  declare getDimPrueba: BelongsToGetAssociationMixin<DimPrueba>;
  declare getDimPlantillaTecnica: BelongsToGetAssociationMixin<DimPlantillaTecnica>;

  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        tecnica_proc: {
          type: DataTypes.STRING(50),
          allowNull: false,
          validate: {
            notNull: { msg: 'tecnica_proc es requerido' },
            notEmpty: { msg: 'tecnica_proc no puede estar vacío' },
          },
        },
        orden: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        obligatoria: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: true,
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
        id_prueba: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        id_plantilla_tecnica: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        tableName: 'dim_tecnicas_proc',
        schema: process.env.DB_SCHEMA,
        timestamps: false,
      }
    );
    this.addScope('withPlantilla', {
      include: [
        {
          model: DimPlantillaTecnica,
          include: [
            {
              model: DimPipeta,
              as: 'dimPipetas',
            },
            {
              model: DimReactivo,
              as: 'dimReactivos',
            },
            {
              model: DimMaquina,
              as: 'dimMaquinas',
            },
            {
              model: DimPlantillaPasos,
              as: 'dimPlantillaPasos',
            },
          ],

          as: 'plantillaTecnica',
          attributes: ['id', 'cod_plantilla_tecnica', 'tecnica'],
          required: false,
        },
      ],
    });
  }

  static associate(models: Record<string, ModelStatic<Model>>) {
    // Relación a DimPrueba
    this.belongsTo(models.DimPrueba, {
      foreignKey: 'id_prueba',
      as: 'dimPrueba',
    });
    // Relación a DimPlantillaTecnica (si existe)
    this.belongsTo(models.DimPlantillaTecnica, {
      foreignKey: 'id_plantilla_tecnica',
      as: 'plantillaTecnica',
    });
    // Asociación inversa: Un proceso puede tener muchas técnicas
    this.hasMany(models.Tecnica, {
      foreignKey: 'id_tecnica_proc',
      as: 'tecnicas',
    });
  }
}
