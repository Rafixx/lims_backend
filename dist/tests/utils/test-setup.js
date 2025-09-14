"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/tests/utils/test-setup.ts
const db_config_1 = require("../../config/db.config");
const index_1 = require("../../models/index");
// Inicializa todos los modelos y asociaciones
beforeAll(async () => {
    (0, index_1.initModels)(db_config_1.sequelize);
    await db_config_1.sequelize.sync({ force: true });
    jest.spyOn(console, 'error').mockImplementation(() => { });
});
// Limpia **todas** las tablas antes de cada test
beforeEach(async () => {
    for (const model of Object.values(db_config_1.sequelize.models)) {
        await model.destroy({ where: {}, truncate: true, cascade: true });
    }
});
afterAll(() => {
    console.error.mockRestore();
});
// Cierra la conexión al terminar
// afterAll(async () => {
//   await sequelize.close();
// });
