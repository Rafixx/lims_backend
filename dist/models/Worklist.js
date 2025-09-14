"use strict";
// src/models/Worklist.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worklist = void 0;
const sequelize_1 = require("sequelize");
class Worklist extends sequelize_1.Model {
    // ============== inicialización ============
    static initModel(sequelize) {
        this.init({
            id_worklist: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nombre: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: true,
            },
            create_dt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            delete_dt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            update_dt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            created_by: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            updated_by: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'worklist',
            schema: process.env.DB_SCHEMA,
            timestamps: true,
            createdAt: 'create_dt',
            updatedAt: 'update_dt',
            paranoid: true,
            deletedAt: 'delete_dt',
        });
    }
    // ============== asociaciones ============
    static associate(models) {
        // Worklist tiene muchas Técnicas
        this.hasMany(models.Tecnica, {
            foreignKey: 'id_worklist',
            as: 'tecnicas',
        });
    }
}
exports.Worklist = Worklist;
