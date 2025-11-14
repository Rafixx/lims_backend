// CREATE TABLE res_final_qubit (
//   id SERIAL PRIMARY KEY,
//   codigo_epi VARCHAR, -- REFERENCES muestra(codigo_epi), --camp test_name de tabla RAW
//   valor VARCHAR, --camp orig_conc de tabla RAW
//   valor_uds VARCHAR, --camp orig_conc_units de tabla RAW
//   valor_fecha VARCHAR, --camp test_date de tabla RAW
//   tipo_ensayo VARCHAR, --camp assay_name de tabla RAW (dsDNA, RNA, etc.)
//   qubit_valor VARCHAR(50), --camp qubit_conc de tabla RAW
//   qubit_uds VARCHAR(50), --camp qubit_conc_uds de tabla RAW
//   analizador VARCHAR DEFAULT 'Qubit',
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

export class ResFinalQubit extends Model<
  InferAttributes<ResFinalQubit>,
  InferCreationAttributes<ResFinalQubit>
> {
  declare id: CreationOptional<number>;
  declare codigo_epi: string | null;
  declare valor: string | null;
  declare valor_uds: string | null;
  declare valor_fecha: string | null;
  declare tipo_ensayo: string | null;
  declare qubit_valor: string | null;
  declare qubit_uds: string | null;
  declare analizador: string;
  declare procesado: boolean;
  declare position: string | null;
  declare create_dt: CreationOptional<Date>;
  declare update_dt: CreationOptional<Date>;
  declare created_by: number | null;
  declare updated_by: number | null;

  static initModel(sequelize: Sequelize) {
    ResFinalQubit.init(
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
        valor: {
          type: DataTypes.STRING,
          allowNull: true,
          comment: 'Concentración original (campo orig_conc de tabla RAW)',
        },
        valor_uds: {
          type: DataTypes.STRING,
          allowNull: true,
          comment:
            'Unidades de concentración original (campo orig_conc_units de tabla RAW)',
        },
        valor_fecha: {
          type: DataTypes.STRING,
          allowNull: true,
          comment: 'Fecha del test (campo test_date de tabla RAW)',
        },
        tipo_ensayo: {
          type: DataTypes.STRING,
          allowNull: true,
          comment:
            'Tipo de ensayo (campo assay_name de tabla RAW: dsDNA, RNA, etc.)',
        },
        qubit_valor: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment:
            'Concentración del tubo Qubit (campo qubit_tube_conc de tabla RAW)',
        },
        qubit_uds: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: 'Unidades del tubo Qubit (campo qubit_units de tabla RAW)',
        },
        analizador: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'Qubit',
          comment: 'Nombre del analizador usado',
        },
        procesado: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Indica si el registro ha sido procesado',
        },
        position: {
          type: DataTypes.STRING,
          allowNull: true,
          comment: 'Posición en placa/rack (opcional, puede venir del CSV)',
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
        tableName: 'res_final_qubit',
        schema: process.env.DB_SCHEMA,
        timestamps: false, // Manejamos create_dt y update_dt manualmente
      }
    );
    return ResFinalQubit;
  }
}

export default ResFinalQubit;
