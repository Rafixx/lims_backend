"use strict";
// src/models/Worklist.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worklist = void 0;
const sequelize_1 = require("sequelize");
const Tecnica_1 = require("./Tecnica");
const Muestra_1 = require("./Muestra");
const Usuario_1 = require("./Usuario");
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
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
            },
            tecnica_proc: {
                type: sequelize_1.DataTypes.STRING(100),
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
        this.addScope('withRefs', {
            include: [
                {
                    model: Tecnica_1.Tecnica,
                    include: [
                        {
                            model: Muestra_1.Muestra,
                            as: 'muestra',
                            attributes: ['codigo_epi', 'codigo_externo'],
                        },
                        {
                            model: Usuario_1.Usuario,
                            as: 'tecnico_resp',
                            attributes: ['nombre'],
                        },
                    ],
                    as: 'tecnicas',
                    attributes: ['estado'],
                },
            ],
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
