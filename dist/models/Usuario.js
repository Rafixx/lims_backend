"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
// src/models/Usuario.ts
const sequelize_1 = require("sequelize");
class Usuario extends sequelize_1.Model {
    static initModel(sequelize) {
        Usuario.init({
            id_usuario: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nombre: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
                defaultValue: null,
            },
            username: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                validate: {
                    notNull: { msg: 'username es requerido' },
                    notEmpty: { msg: 'username no puede estar vacío' },
                },
            },
            passwordhash: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    notNull: { msg: 'passwordhash es requerido' },
                    notEmpty: { msg: 'passwordhash no puede estar vacío' },
                },
            },
            email: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    notNull: { msg: 'email es requerido' },
                    isEmail: { msg: 'email debe tener formato válido' },
                },
            },
            id_rol: {
                type: sequelize_1.DataTypes.INTEGER,
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
        });
    }
    static associate(models) {
        this.belongsTo(models.Rol, { foreignKey: 'id_rol', as: 'rol' });
    }
}
exports.Usuario = Usuario;
