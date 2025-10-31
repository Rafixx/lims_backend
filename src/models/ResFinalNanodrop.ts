// CREATE TABLE res_final_nanodrop (
//   id SERIAL PRIMARY KEY,
//   codigo_epi VARCHAR, -- REFERENCES muestra(codigo_epi), --camp sample_code de tabla RAW
//   valor_conc_nucleico NUMERIC, --camp an_cant de tabla RAW
//   valor_uds VARCHAR DEFAULT 'ng/uL',
//   valor_fecha VARCHAR, --camp fecha de tabla RAW
//   ratio260_280 NUMERIC, --camp a260_280 de tabla RAW
//   ratio260_230 NUMERIC, --camp a260_230 de tabla RAW
//   abs_260 NUMERIC, --camp a260 de tabla RAW
//   abs_280 NUMERIC, --camp a280 de tabla RAW
//   analizador VARCHAR DEFAULT 'NanoDrop',
//   procesado BOOLEAN DEFAULT FALSE,
//   create_dt timestamp DEFAULT now(),
//   update_dt timestamp DEFAULT now(),
//   created_by int,
//   updated_by int
// );

import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class ResFinalNanodrop extends Model<
  InferAttributes<ResFinalNanodrop>,
  InferCreationAttributes<ResFinalNanodrop>
> {
  declare id: CreationOptional<number>;
  declare codigo_epi: string | null;
  declare valor_conc_nucleico: number | null;
  declare valor_uds: string;
  declare valor_fecha: string | null;
  declare ratio260_280: number | null;
  declare ratio260_230: number | null;
  declare abs_260: number | null;
  declare abs_280: number | null;
  declare analizador: string;
  declare procesado: boolean;
  declare create_dt: CreationOptional<Date>;
  declare update_dt: CreationOptional<Date>;
  declare created_by: number | null;
  declare updated_by: number | null;

  static initModel(sequelize: Sequelize) {
    ResFinalNanodrop.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        codigo_epi: {
          type: DataTypes.STRING,
          allowNull: true,
          comment: 'Código epidemiológico - referencia a muestra.codigo_epi',
        },
        valor_conc_nucleico: {
          type: DataTypes.DECIMAL,
          allowNull: true,
          comment:
            'Concentración de ácido nucleico (campo an_cant de tabla RAW)',
        },
        valor_uds: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'ng/uL',
          comment: 'Unidades de concentración',
        },
        valor_fecha: {
          type: DataTypes.STRING,
          allowNull: true,
          comment: 'Fecha del valor (campo fecha de tabla RAW)',
        },
        ratio260_280: {
          type: DataTypes.DECIMAL,
          allowNull: true,
          comment: 'Ratio A260/A280 - pureza de proteínas',
        },
        ratio260_230: {
          type: DataTypes.DECIMAL,
          allowNull: true,
          comment: 'Ratio A260/A230 - pureza de contaminantes orgánicos',
        },
        abs_260: {
          type: DataTypes.DECIMAL,
          allowNull: true,
          comment: 'Absorbancia a 260nm',
        },
        abs_280: {
          type: DataTypes.DECIMAL,
          allowNull: true,
          comment: 'Absorbancia a 280nm',
        },
        analizador: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'NanoDrop',
          comment: 'Nombre del analizador usado',
        },
        procesado: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Indica si el registro ha sido procesado',
        },
        create_dt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'create_dt',
        },
        update_dt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'update_dt',
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: 'ID del usuario que creó el registro',
        },
        updated_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: 'ID del usuario que actualizó el registro',
        },
      },
      {
        sequelize,
        tableName: 'res_final_nanodrop',
        schema: process.env.DB_SCHEMA,
        timestamps: false, // Manejamos create_dt y update_dt manualmente
      }
    );
    return ResFinalNanodrop;
  }
}

export default ResFinalNanodrop;
