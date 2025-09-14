"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_config_1 = require("./config/db.config");
const models_1 = require("./models");
const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        // Inicializar los modelos
        (0, models_1.initModels)(db_config_1.sequelize);
        await db_config_1.sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
        app_1.default.listen(PORT, () => {
            console.log(`Servidor escuchando en el puerto ${PORT}`);
        });
    }
    catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
        process.exit(1);
    }
};
startServer();
