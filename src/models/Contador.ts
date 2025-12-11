// src/models/Contador.ts
import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class Contador extends Model<
  InferAttributes<Contador>,
  InferCreationAttributes<Contador>
> {
  declare contador: string;
  declare year: number;
  declare current_value: CreationOptional<number>;

  static initModel(sequelize: Sequelize) {
    this.init(
      {
        contador: {
          type: DataTypes.STRING(50),
          allowNull: false,
          primaryKey: true,
        },
        year: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        current_value: {
          type: DataTypes.BIGINT,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        tableName: 'contadores',
        schema: process.env.DB_SCHEMA,
        timestamps: false,
      }
    );
  }
}
