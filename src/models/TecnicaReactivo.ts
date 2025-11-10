import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ModelStatic,
} from 'sequelize';

export class TecnicaReactivo extends Model<
  InferAttributes<TecnicaReactivo>,
  InferCreationAttributes<TecnicaReactivo>
> {
  // ============== columnas ==============
  declare id: CreationOptional<number>;
  declare id_tecnica?: number;
  declare id_reactivo?: number;
  declare volumen?: string;
  declare lote?: string;
  declare delete_dt?: Date | null;
  declare update_dt?: Date;
  declare created_by?: number;
  declare updated_by?: number;

  // ============== inicialización ============
  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        id_tecnica: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        id_reactivo: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        volumen: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        lote: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        delete_dt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        update_dt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: DataTypes.NOW,
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        updated_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'tecnicas_reactivos',
        schema: 'lims_pre',
        timestamps: true,
        createdAt: false,
        updatedAt: 'update_dt',
        paranoid: true,
        deletedAt: 'delete_dt',
      }
    );
  }
  static associate(models: Record<string, ModelStatic<Model>>) {
    this.belongsTo(models.Tecnica, {
      foreignKey: 'id_tecnica',
      as: 'tecnica',
    });
    this.belongsTo(models.DimReactivo, {
      foreignKey: 'id_reactivo',
      as: 'reactivo',
    });
  }
}

// CREATE TABLE lims_pre.tecnicas_reactivos (
// 	id serial4 NOT NULL,
// 	id_tecnica int4 NULL,
// 	id_reactivo int4 NULL,
// 	volumen varchar(50) NULL,
// 	lote varchar(255) NULL,
// 	delete_dt date NULL,
// 	update_dt timestamp DEFAULT now() NULL,
// 	created_by int4 NULL,
// 	updated_by int4 NULL,
// 	CONSTRAINT tecnicas_reactivos_pkey PRIMARY KEY (id)
// );
