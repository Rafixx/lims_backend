"use strict";
// src/models/Rol.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rol = void 0;
const sequelize_1 = require("sequelize");
class Rol extends sequelize_1.Model {
    static initModel(sequelize) {
        Rol.init({
            id_rol: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                validate: {
                    notNull: { msg: 'name es requerido' },
                    notEmpty: { msg: 'name no puede estar vacío' },
                },
            },
            management_users: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: null,
            },
            read_only: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: null,
            },
            export: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: null,
            },
            create_dt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            update_dt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            delete_dt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'roles',
            schema: process.env.DB_SCHEMA,
            timestamps: true,
            createdAt: 'create_dt',
            updatedAt: 'update_dt',
            paranoid: true,
            deletedAt: 'delete_dt',
        });
    }
    static associate(models) {
        // Un rol tiene muchos usuarios
        this.hasMany(models.Usuario, {
            foreignKey: 'id_rol',
            as: 'usuarios',
        });
    }
}
exports.Rol = Rol;
