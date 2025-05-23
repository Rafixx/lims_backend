import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware';
// Importar tus rutas aquí
import { solicitudRoutes } from './routes/solicitud.routes';
import { muestraRoutes } from './routes/muestra.routes';
import { tecnicaRoutes } from './routes/tecnica.routes';
import { dimClienteRoutes } from './routes/dimCliente.routes';
import { dimPlantillaTecnicaRoutes } from './routes/dimPlantillaTecnica.routes copy';
import { dimPruebaRoutes } from './routes/dimPrueba.routes';
import { dimTecnicaProcRoutes } from './routes/dimTecnicaProc.routes';
import { authRoutes } from './routes/auth.routes';
import { usuarioRoutes } from './routes/usuario.routes';
import { dimTipoMuestraRoutes } from './routes/dimTipoMuestra.routes';
import { dimUbicacionRoutes } from './routes/dimUbicacion.routes';
import { dimPacienteRoutes } from './routes/dimPaciente.routes';
import { dimReactivoRoutes } from './routes/dimReactivo.routes';
import { dimPipetaRoutes } from './routes/dimPipeta.routes';
import { dimMaquinaRoutes } from './routes/dimMaquina.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Registrar las rutas
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/muestras', muestraRoutes);
app.use('/api/tecnicas', tecnicaRoutes);
app.use('/api/clientes', dimClienteRoutes);
app.use('/api/dimPlantillaTecnicas', dimPlantillaTecnicaRoutes);
app.use('/api/pruebas', dimPruebaRoutes);
app.use('/api/dimTecnicaProc', dimTecnicaProcRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/login', authRoutes);
app.use('/api/tiposMuestra', dimTipoMuestraRoutes);
app.use('/api/ubicaciones', dimUbicacionRoutes);
app.use('/api/pacientes', dimPacienteRoutes);
app.use('/api/reactivos', dimReactivoRoutes);
app.use('/api/pipetas', dimPipetaRoutes);
app.use('/api/maquinas', dimMaquinaRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

export default app;
