// src/models/Solicitud.ts
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
import { Muestra } from './Muestra';

export class Solicitud extends Model<
  InferAttributes<Solicitud>,
  InferCreationAttributes<Solicitud>
> {
  // Solo declaras una vez el tipo TS; Sequelize infiere el resto
  declare id_solicitud: CreationOptional<number>;
  declare num_solicitud?: string;
  declare id_cliente: number;
  declare id_prueba?: number;
  declare f_creacion?: Date;
  declare f_entrada?: Date;
  declare f_compromiso?: Date;
  declare f_entrega?: Date;
  declare f_resultado?: Date;
  declare condiciones_envio?: string;
  declare tiempo_hielo?: string;
  declare estado_solicitud: string;
  declare delete_dt?: Date;
  declare update_dt?: Date;
  declare created_by?: number;
  declare updated_by?: number;

  declare getMuestras: HasManyGetAssociationsMixin<Muestra>;

  // ... y así con el resto de columnas

  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id_solicitud: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        num_solicitud: {
          type: DataTypes.STRING(20),
          allowNull: true,
          defaultValue: null,
        },
        id_cliente: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            notNull: { msg: 'id_cliente es requerido' },
            isInt: { msg: 'id_paciente debe ser numérico' },
          },
        },
        id_prueba: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        f_creacion: DataTypes.DATE,
        f_entrada: DataTypes.DATE,
        f_compromiso: DataTypes.DATE,
        f_entrega: DataTypes.DATE,
        f_resultado: DataTypes.DATE,
        condiciones_envio: DataTypes.STRING(50),
        tiempo_hielo: DataTypes.STRING(20),
        estado_solicitud: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: 'CREADA',
        },
        delete_dt: { type: DataTypes.DATE, allowNull: true },
        update_dt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        created_by: DataTypes.INTEGER,
        updated_by: DataTypes.INTEGER,
      },
      {
        sequelize,
        tableName: 'solicitud',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: 'f_creacion',
        updatedAt: 'update_dt',
        paranoid: true,
        deletedAt: 'delete_dt',
      }
    );
  }
  static associate(models: Record<string, ModelStatic<Model>>) {
    this.hasMany(models.Muestra, {
      foreignKey: 'id_muestra',
      as: 'muestras',
    });
    // …añade aquí el resto de relaciones
  }
}
