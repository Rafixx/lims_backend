import app from './app';
import { sequelize } from './config/db.config';
import { initModels } from './models';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Inicializar los modelos
    initModels(sequelize);

    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
};

startServer();
