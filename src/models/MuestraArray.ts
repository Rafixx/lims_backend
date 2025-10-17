import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ModelStatic,
} from 'sequelize';
import { Usuario } from './Usuario';

export class MuestraArray extends Model<
  InferAttributes<MuestraArray>,
  InferCreationAttributes<MuestraArray>
> {
  declare id_array: CreationOptional<number>;
  declare id_muestra: CreationOptional<number>;
  declare id_posicion: CreationOptional<number>;
  declare codigo_placa: CreationOptional<string>;
  declare posicion_placa: CreationOptional<string>;
  declare f_creacion: CreationOptional<Date>;
  declare f_envio_escanear: CreationOptional<Date>;
  declare num_array: CreationOptional<number>;
  declare num_serie: CreationOptional<string>;
  declare pos_array: CreationOptional<string>;
  declare delete_dt: CreationOptional<Date>;
  declare update_dt: CreationOptional<Date>;
  declare created_by: CreationOptional<number>;
  declare updated_by: CreationOptional<number>;

  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id_array: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        id_muestra: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'muestra',
            key: 'id_muestra',
          },
        },
        id_posicion: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        codigo_placa: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        posicion_placa: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        f_creacion: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        f_envio_escanear: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        num_array: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        num_serie: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        pos_array: {
          type: DataTypes.STRING(20),
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
          references: {
            model: Usuario,
            key: 'id_usuario',
          },
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        updated_by: {
          references: {
            model: Usuario,
            key: 'id_usuario',
          },
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'muestra_array',
        schema: 'lims_pre',
        timestamps: true,
        paranoid: true,
        createdAt: 'f_creacion',
        updatedAt: 'update_dt',
        deletedAt: 'delete_dt',
      }
    );
    this.addScope('withRefs', {
      include: [
        {
          association: 'muestra',
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
    this.hasMany(models.Tecnica, {
      foreignKey: 'id_array',
      as: 'tecnicas',
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
