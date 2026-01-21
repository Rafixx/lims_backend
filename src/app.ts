import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware';
// Importar tus rutas aquí
import { solicitudRoutes } from './routes/solicitud.routes';
import { muestraRoutes } from './routes/muestra.routes';
import { tecnicaRoutes } from './routes/tecnica.routes';
import { dimClienteRoutes } from './routes/dimCliente.routes';
import { dimPlantillaTecnicaRoutes } from './routes/dimPlantillaTecnica.routes';
import { dimPlantillaPasosRoutes } from './routes/dimPlantillaPasos.routes';
import { dimPruebaRoutes } from './routes/dimPrueba.routes';
import { dimTecnicaProcRoutes } from './routes/dimTecnicaProc.routes';
import { authRoutes } from './routes/auth.routes';
import { usuarioRoutes } from './routes/usuario.routes';
import { rolRoutes } from './routes/rol.routes';
import { dimTipoMuestraRoutes } from './routes/dimTipoMuestra.routes';
import { dimUbicacionRoutes } from './routes/dimUbicacion.routes';
import { dimPacienteRoutes } from './routes/dimPaciente.routes';
import { dimReactivoRoutes } from './routes/dimReactivo.routes';
import { dimPipetaRoutes } from './routes/dimPipeta.routes';
import { dimMaquinaRoutes } from './routes/dimMaquina.routes';
import { dimCentroRoutes } from './routes/dimCentro.routes';
import { dimCriterioValidacionRoutes } from './routes/dimCriterioValidacion.routes';
import { tecnicoLabRoutes } from './routes/tecnicoLab.routes';
import { tecnicaReactivoRoutes } from './routes/tecnicaReactivo.routes';
import { worklistRouter } from './routes/worklist.routes';
import { resultadoRouter } from './routes/resultado.routes';
import estadoRoutes from './routes/estado.routes';
import { externalizacionRoutes } from './routes/externalizacion.routes';

const app = express();

app.use(cors());
app.use(express.json());

// test endpoint
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, service: 'lims_backend' })
);

// Registrar las rutas
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/muestras', muestraRoutes);
app.use('/api/tecnicas', tecnicaRoutes);
app.use('/api/clientes', dimClienteRoutes);
app.use('/api/plantillasTecnicas', dimPlantillaTecnicaRoutes);
app.use('/api/plantillasPasos', dimPlantillaPasosRoutes);
app.use('/api/pruebas', dimPruebaRoutes);
app.use('/api/tecnicasProc', dimTecnicaProcRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/login', authRoutes);
app.use('/api/tiposMuestra', dimTipoMuestraRoutes);
app.use('/api/ubicaciones', dimUbicacionRoutes);
app.use('/api/pacientes', dimPacienteRoutes);
app.use('/api/reactivos', dimReactivoRoutes);
app.use('/api/pipetas', dimPipetaRoutes);
app.use('/api/maquinas', dimMaquinaRoutes);
app.use('/api/centros', dimCentroRoutes);
app.use('/api/criteriosValidacion', dimCriterioValidacionRoutes);
app.use('/api/tecnicosLab', tecnicoLabRoutes);
app.use('/api/tecnicasReactivos', tecnicaReactivoRoutes);
app.use('/api/worklists', worklistRouter);
app.use('/api/resultados', resultadoRouter);
app.use('/api/estados', estadoRoutes);
app.use('/api/externalizaciones', externalizacionRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

export default app;
