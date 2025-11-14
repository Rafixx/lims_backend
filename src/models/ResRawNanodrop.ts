// CREATE TABLE res_raw_nanodrop (
// 	id serial PRIMARY KEY,
// 	fecha VARCHAR(50),
// 	sample_code VARCHAR(50),
// 	an_cant VARCHAR(50),
// 	a260_280 VARCHAR(50),
// 	a260_230 VARCHAR(50),
// 	a260 VARCHAR(50),
// 	a280 VARCHAR(50),
// 	an_factor VARCHAR(50),
// 	correcion_lb VARCHAR(50),
// 	absorbancia_lb VARCHAR(50),
// 	corregida VARCHAR(50),
// 	porc_corregido VARCHAR(50),
// 	impureza1 VARCHAR(50),
// 	impureza1_a260 VARCHAR(50),
// 	impureza1_porc VARCHAR(50),
// 	impureza1_mm VARCHAR(50),
// 	impureza2 VARCHAR(50),
// 	impureza2_a260 VARCHAR(50),
// 	impureza2_porc VARCHAR(50),
// 	impureza2_mm VARCHAR(50),
// 	impureza3 VARCHAR(50),
// 	impureza3_a260 VARCHAR(50),
// 	impureza3_porc VARCHAR(50),
// 	impureza3_mm VARCHAR(50),
// 	createdAt timestamp DEFAULT CURRENT_TIMESTAMP
// );

import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class ResRawNanodrop extends Model<
  InferAttributes<ResRawNanodrop>,
  InferCreationAttributes<ResRawNanodrop>
> {
  declare id: CreationOptional<number>;
  declare fecha: string;
  declare sample_code: string;
  declare an_cant: string;
  declare a260_280: string;
  declare a260_230: string;
  declare a260: string;
  declare a280: string;
  declare an_factor: string;
  declare correcion_lb: string;
  declare absorbancia_lb: string;
  declare corregida: string;
  declare porc_corregido: string;
  declare impureza1: string;
  declare impureza1_a260: string;
  declare impureza1_porc: string;
  declare impureza1_mm: string;
  declare impureza2: string;
  declare impureza2_a260: string;
  declare impureza2_porc: string;
  declare impureza2_mm: string;
  declare impureza3: string;
  declare impureza3_a260: string;
  declare impureza3_porc: string;
  declare impureza3_mm: string;
  declare position: string | null; // ✅ NUEVO CAMPO
  declare createdAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize) {
    ResRawNanodrop.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        fecha: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        sample_code: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        an_cant: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        a260_280: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        a260_230: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        a260: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        a280: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        an_factor: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        correcion_lb: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        absorbancia_lb: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        corregida: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        porc_corregido: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        impureza1: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        impureza1_a260: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        impureza1_porc: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        impureza1_mm: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        impureza2: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        impureza2_a260: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        impureza2_porc: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        impureza2_mm: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        impureza3: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        impureza3_a260: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        impureza3_porc: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        impureza3_mm: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        position: {
          type: DataTypes.STRING,
          allowNull: true,
          comment: 'Posición en placa/rack (opcional, puede venir del CSV)',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'createdat', // Nombre real de la columna en la BD (minúsculas)
        },
      },
      {
        sequelize,
        tableName: 'res_raw_nanodrop',
        schema: process.env.DB_SCHEMA,
        timestamps: true, // Activar timestamps
        createdAt: 'createdAt', // Mapear createdAt
        updatedAt: false, // No usar updatedAt
      }
    );
    return ResRawNanodrop;
  }
}

export default ResRawNanodrop;
