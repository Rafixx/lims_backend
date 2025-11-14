import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class ResRawQubit extends Model<
  InferAttributes<ResRawQubit>,
  InferCreationAttributes<ResRawQubit>
> {
  declare id: CreationOptional<number>;
  declare run_id: string | null;
  declare assay_name: string | null;
  declare test_name: string | null;
  declare test_date: string | null;
  declare qubit_tube_conc: string | null;
  declare qubit_units: string | null;
  declare orig_conc: string | null;
  declare orig_conc_units: string | null;
  declare sample_volume_ul: string | null;
  declare dilution_factor: string | null;
  declare std1_rfu: string | null;
  declare std2_rfu: string | null;
  declare std3_rfu: string | null;
  declare excitation: string | null;
  declare emission: string | null;
  declare green_rfu: string | null;
  declare far_red_rfu: string | null;
  declare fecha: Date | null;
  declare position: string | null;
  declare createdAt: CreationOptional<Date>;

  public static initModel(sequelize: Sequelize): typeof ResRawQubit {
    ResRawQubit.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        run_id: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        assay_name: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        test_name: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        test_date: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        qubit_tube_conc: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        qubit_units: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        orig_conc: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        orig_conc_units: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        sample_volume_ul: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        dilution_factor: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        std1_rfu: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        std2_rfu: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        std3_rfu: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        excitation: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        emission: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        green_rfu: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        far_red_rfu: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        fecha: {
          type: DataTypes.DATE,
          allowNull: true,
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
          field: 'createdat',
        },
      },
      {
        sequelize,
        tableName: 'res_raw_qubit',
        schema: 'lims_pre',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: false,
        paranoid: false,
      }
    );

    return ResRawQubit;
  }
}

export default ResRawQubit;
