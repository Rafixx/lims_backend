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

// CREATE TABLE lims_pre.dim_plantilla_pasos (
// 	id serial4 NOT NULL,
// 	codigo varchar(20) NULL,
// 	descripcion varchar(100) NOT NULL,
// 	orden int4 null,
// 	activa bool DEFAULT true NULL,
// 	created_by int4 NULL,
// 	update_dt timestamp DEFAULT now() NULL,
// 	id_plantilla_tecnica int4 NULL,
// 	CONSTRAINT dim_plantilla_pasos_pkey PRIMARY KEY (id)
// );

export class DimPlantillaPasos extends Model<
  InferAttributes<DimPlantillaPasos>,
  InferCreationAttributes<DimPlantillaPasos>
> {
  declare id: CreationOptional<number>;
  declare codigo?: string;
  declare descripcion: string;
  declare orden?: number;
  declare activa?: boolean;
  declare created_by?: number;
  declare update_dt?: Date;
  declare id_plantilla_tecnica?: number;

  declare plantilla_tecnica?: DimPlantillaTecnica;

  static initModel(sequelize: Sequelize) {
    DimPlantillaPasos.init(
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
        descripcion: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notNull: { msg: 'El campo descripcion es requerido' },
          },
        },
        orden: {
          type: DataTypes.INTEGER,
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
        tableName: 'dim_plantilla_pasos',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: false,
        updatedAt: 'update_dt',
        paranoid: false,
      }
    );
  }

  static associate(models: Record<string, ModelStatic<Model>>) {
    // cada paso puede vincularse a una plantilla técnica
    DimPlantillaPasos.belongsTo(models.DimPlantillaTecnica, {
      foreignKey: 'id_plantilla_tecnica',
      as: 'plantilla_tecnica',
    });
  }
}
