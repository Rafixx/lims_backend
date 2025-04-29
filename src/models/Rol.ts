// src/models/Rol.ts

import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ModelStatic,
} from 'sequelize';

export class Rol extends Model<
  InferAttributes<Rol>,
  InferCreationAttributes<Rol>
> {
  declare id_rol: CreationOptional<number>;
  declare name: string;
  declare management_users?: boolean;
  declare read_only?: boolean;
  declare export?: boolean;
  declare create_dt: CreationOptional<Date>;
  declare update_dt: CreationOptional<Date>;
  declare delete_dt?: Date;

  static initModel(sequelize: Sequelize) {
    Rol.init(
      {
        id_rol: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          validate: {
            notNull: { msg: 'name es requerido' },
            notEmpty: { msg: 'name no puede estar vacío' },
          },
        },
        management_users: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: null,
        },
        read_only: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: null,
        },
        export: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: null,
        },
        create_dt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
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
        tableName: 'roles',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: 'create_dt',
        updatedAt: 'update_dt',
        paranoid: true,
        deletedAt: 'delete_dt',
      }
    );
  }

  static associate(models: Record<string, ModelStatic<Model>>) {
    // Un rol tiene muchos usuarios
    this.hasMany(models.Usuario, {
      foreignKey: 'id_rol',
      as: 'usuarios',
    });
  }
}
