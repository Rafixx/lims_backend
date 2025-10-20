// src/models/Resultado.ts
import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ModelStatic,
} from 'sequelize';
import { Muestra } from './Muestra';
import { Tecnica } from './Tecnica';
import { Usuario } from './Usuario';

export class Resultado extends Model<
  InferAttributes<Resultado>,
  InferCreationAttributes<Resultado>
> {
  declare id_resultado: CreationOptional<number>;
  declare id_muestra: number;
  declare id_tecnica: number;
  declare tipo_res?: string;
  declare valor?: string;
  declare valor_texto?: string;
  declare valor_fecha?: Date;
  declare unidades?: string;
  declare f_resultado?: Date;
  declare f_validacion?: Date;
  declare validado?: boolean;
  declare dentro_rango?: boolean;
  declare delete_dt?: Date;
  declare update_dt: CreationOptional<Date>;
  declare created_by?: number;
  declare updated_by?: number;

  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id_resultado: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        id_muestra: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            notNull: { msg: 'id_muestra es requerido' },
            isInt: { msg: 'id_muestra debe ser numérico' },
          },
          references: {
            model: 'muestra',
            key: 'id_muestra',
          },
        },
        id_tecnica: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            notNull: { msg: 'id_tecnica es requerido' },
            isInt: { msg: 'id_tecnica debe ser numérico' },
          },
          references: {
            model: 'tecnicas',
            key: 'id_tecnica',
          },
        },
        tipo_res: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        valor: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        valor_texto: {
          type: DataTypes.STRING(1000),
          allowNull: true,
        },
        valor_fecha: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        unidades: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        f_resultado: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        f_validacion: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        validado: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
        dentro_rango: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        delete_dt: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        update_dt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'usuario',
            key: 'id_usuario',
          },
        },
        updated_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'usuario',
            key: 'id_usuario',
          },
        },
      },
      {
        sequelize,
        tableName: 'resultado',
        schema: process.env.DB_SCHEMA,
        timestamps: true,
        paranoid: true,
        createdAt: false,
        updatedAt: 'update_dt',
        deletedAt: 'delete_dt',
      }
    );

    this.addScope('withRefs', {
      include: [
        {
          model: Muestra,
          as: 'muestra',
          attributes: ['id_muestra', 'codigo_epi', 'codigo_externo'],
        },
        {
          model: Tecnica,
          as: 'tecnica',
          attributes: ['id_tecnica', 'id_tecnica_proc', 'estado'],
        },
        {
          model: Usuario,
          as: 'creador',
          attributes: ['id_usuario', 'nombre', 'username'],
        },
        {
          model: Usuario,
          as: 'actualizador',
          attributes: ['id_usuario', 'nombre', 'username'],
        },
      ],
    });
  }

  static associate(models: Record<string, ModelStatic<Model>>) {
    this.belongsTo(models.Muestra, {
      foreignKey: 'id_muestra',
      as: 'muestra',
    });
    this.belongsTo(models.Tecnica, {
      foreignKey: 'id_tecnica',
      as: 'tecnica',
    });
    this.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'creador',
    });
    this.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'actualizador',
    });
  }
}
