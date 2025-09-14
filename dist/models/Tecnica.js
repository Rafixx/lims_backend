"use strict";
// src/models/Tecnica.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tecnica = void 0;
const sequelize_1 = require("sequelize");
class Tecnica extends sequelize_1.Model {
    // ============== inicialización ============
    static initModel(sequelize) {
        this.init({
            id_tecnica: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            id_muestra: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: { msg: 'id_muestra es requerido' },
                },
            },
            id_tecnica_proc: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: { msg: 'id_tecnica_proc es requerido' },
                },
            },
            id_tecnico_resp: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            id_worklist: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            fecha_inicio_tec: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            estado: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: true,
                defaultValue: 'CREADA',
            },
            fecha_estado: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            comentarios: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
                defaultValue: null,
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
            tableName: 'tecnicas',
            schema: process.env.DB_SCHEMA,
            timestamps: true,
            createdAt: false,
            updatedAt: 'update_dt',
            paranoid: true,
            deletedAt: 'delete_dt',
        });
    }
    // ============== asociaciones ============
    static associate(models) {
        // Técnica pertenece a una Muestra
        this.belongsTo(models.Muestra, {
            foreignKey: 'id_muestra',
            as: 'muestra',
        });
        this.belongsTo(models.DimTecnicaProc, {
            foreignKey: 'id_tecnica_proc',
            as: 'tecnica_proc',
        });
        // Técnica pertenece a un Usuario (técnico responsable)
        this.belongsTo(models.Usuario, {
            foreignKey: 'id_tecnico_resp',
            as: 'tecnico',
        });
        //Tecnica puede pertenecer a un Worklist
        this.belongsTo(models.Worklist, {
            foreignKey: 'id_worklist',
            as: 'worklist',
        });
    }
}
exports.Tecnica = Tecnica;
