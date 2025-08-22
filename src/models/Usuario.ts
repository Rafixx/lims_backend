// src/models/Usuario.ts
import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ModelStatic,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from 'sequelize';
import { Rol } from './Rol';

export class Usuario extends Model<
  InferAttributes<Usuario>,
  InferCreationAttributes<Usuario>
> {
  declare id_usuario: CreationOptional<number>;
  declare nombre: CreationOptional<string>;
  declare username: string;
  declare passwordhash: string;
  declare email: string;
  declare id_rol: CreationOptional<number>;
  declare rol?: Rol; // relación cargada con include

  declare create_dt: CreationOptional<Date>;
  declare update_dt: CreationOptional<Date>;
  declare delete_dt: CreationOptional<Date>;

  declare getRol: BelongsToGetAssociationMixin<Rol>;
  declare setRol: BelongsToSetAssociationMixin<Rol, number>;
  declare createRol: BelongsToCreateAssociationMixin<Rol>;

  static initModel(sequelize: Sequelize) {
    Usuario.init(
      {
        id_usuario: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        nombre: {
          type: DataTypes.STRING(255),
          allowNull: true,
          defaultValue: null,
        },
        username: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
          validate: {
            notNull: { msg: 'username es requerido' },
            notEmpty: { msg: 'username no puede estar vacío' },
          },
        },
        passwordhash: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notNull: { msg: 'passwordhash es requerido' },
            notEmpty: { msg: 'passwordhash no puede estar vacío' },
          },
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notNull: { msg: 'email es requerido' },
            isEmail: { msg: 'email debe tener formato válido' },
          },
        },
        id_rol: {
          type: DataTypes.INTEGER,
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
        tableName: 'usuarios',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        createdAt: 'create_dt',
        updatedAt: 'update_dt',
        paranoid: true,
        deletedAt: 'delete_dt',

        // 🔐 por defecto, nunca exponer passwordhash
        defaultScope: {
          attributes: { exclude: ['passwordhash'] },
        },

        // Scopes específicos
        scopes: {
          tecnicosLab: {
            where: { id_rol: 2 },
            attributes: ['id_usuario', 'nombre'],
          },
          authScope: {
            attributes: { include: ['passwordhash'] },
          },
        },
      }
    );
  }

  static associate(models: Record<string, ModelStatic<Model>>) {
    this.belongsTo(models.Rol, { foreignKey: 'id_rol', as: 'rol' });
  }
}
