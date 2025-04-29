//src/models/Dim_cliente.ts
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
import { Solicitud } from './Solicitud';

export class DimCliente extends Model<
  InferAttributes<DimCliente>,
  InferCreationAttributes<DimCliente>
> {
  // ============== columnas ==============
  declare id: CreationOptional<number>;
  declare nombre?: string;
  declare razon_social?: string;
  declare nif?: string;
  declare direccion?: string;
  declare activo: CreationOptional<boolean>;
  declare created_by?: number;
  declare update_dt: CreationOptional<Date>;
  declare delete_dt?: CreationOptional<Date>;

  // Asociación
  declare getSolicitudes: HasManyGetAssociationsMixin<Solicitud>;

  // ============== inicialización ============
  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        nombre: {
          type: DataTypes.STRING(50),
          allowNull: true,
          defaultValue: null,
        },
        razon_social: {
          type: DataTypes.STRING(100),
          allowNull: true,
          defaultValue: null,
        },
        nif: {
          type: DataTypes.STRING(20),
          allowNull: true,
          defaultValue: null,
        },
        direccion: {
          type: DataTypes.STRING(20),
          allowNull: true,
          defaultValue: null,
        },
        activo: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
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
        delete_dt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'dim_clientes',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: false,
        updatedAt: 'update_dt',
        paranoid: true,
        deletedAt: 'delete_dt',
      }
    );
  }

  // ============== asociaciones ============
  static associate(models: Record<string, ModelStatic<Model>>) {
    this.hasMany(models.Solicitud, {
      foreignKey: 'id_cliente',
      as: 'solicitudes',
    });
  }
}
