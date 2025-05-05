// src/tests/utils/test-setup.ts
import { sequelize } from '../../config/db.config';
import { initModels } from '../../models/index';

// Inicializa todos los modelos y asociaciones
beforeAll(async () => {
  initModels(sequelize);
  await sequelize.sync({ force: true });
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Limpia **todas** las tablas antes de cada test
beforeEach(async () => {
  for (const model of Object.values(sequelize.models)) {
    await model.destroy({ where: {}, truncate: true, cascade: true });
  }
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

// Cierra la conexión al terminar
// afterAll(async () => {
//   await sequelize.close();
// });
