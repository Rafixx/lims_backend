import app from './app';
import { sequelize } from './config/db.config';
import { initModels } from './models';

const PORT = parseInt(process.env.PORT || '3000', 10);

if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET no está configurado. Detener el servidor.');
  process.exit(1);
}

const startServer = async () => {
  try {
    // Inicializar los modelos
    initModels(sequelize);

    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
};

startServer();
