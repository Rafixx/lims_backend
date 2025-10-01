"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_middleware_1 = require("./middlewares/error.middleware");
// Importar tus rutas aquí
const solicitud_routes_1 = require("./routes/solicitud.routes");
const muestra_routes_1 = require("./routes/muestra.routes");
const tecnica_routes_1 = require("./routes/tecnica.routes");
const dimCliente_routes_1 = require("./routes/dimCliente.routes");
const dimPlantillaTecnica_routes_1 = require("./routes/dimPlantillaTecnica.routes");
const dimPrueba_routes_1 = require("./routes/dimPrueba.routes");
const dimTecnicaProc_routes_1 = require("./routes/dimTecnicaProc.routes");
const auth_routes_1 = require("./routes/auth.routes");
const usuario_routes_1 = require("./routes/usuario.routes");
const rol_routes_1 = require("./routes/rol.routes");
const dimTipoMuestra_routes_1 = require("./routes/dimTipoMuestra.routes");
const dimUbicacion_routes_1 = require("./routes/dimUbicacion.routes");
const dimPaciente_routes_1 = require("./routes/dimPaciente.routes");
const dimReactivo_routes_1 = require("./routes/dimReactivo.routes");
const dimPipeta_routes_1 = require("./routes/dimPipeta.routes");
const dimMaquina_routes_1 = require("./routes/dimMaquina.routes");
const dimCentro_routes_1 = require("./routes/dimCentro.routes");
const dimCriterioValidacion_routes_1 = require("./routes/dimCriterioValidacion.routes");
const tecnicoLab_routes_1 = require("./routes/tecnicoLab.routes");
const worklist_routes_1 = require("./routes/worklist.routes");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// test endpoint
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'lims_backend' }));
// Registrar las rutas
app.use('/api/solicitudes', solicitud_routes_1.solicitudRoutes);
app.use('/api/muestras', muestra_routes_1.muestraRoutes);
app.use('/api/tecnicas', tecnica_routes_1.tecnicaRoutes);
app.use('/api/clientes', dimCliente_routes_1.dimClienteRoutes);
app.use('/api/plantillasTecnicas', dimPlantillaTecnica_routes_1.dimPlantillaTecnicaRoutes);
app.use('/api/pruebas', dimPrueba_routes_1.dimPruebaRoutes);
app.use('/api/tecnicasProc', dimTecnicaProc_routes_1.dimTecnicaProcRoutes);
app.use('/api/usuarios', usuario_routes_1.usuarioRoutes);
app.use('/api/roles', rol_routes_1.rolRoutes);
app.use('/api/login', auth_routes_1.authRoutes);
app.use('/api/tiposMuestra', dimTipoMuestra_routes_1.dimTipoMuestraRoutes);
app.use('/api/ubicaciones', dimUbicacion_routes_1.dimUbicacionRoutes);
app.use('/api/pacientes', dimPaciente_routes_1.dimPacienteRoutes);
app.use('/api/reactivos', dimReactivo_routes_1.dimReactivoRoutes);
app.use('/api/pipetas', dimPipeta_routes_1.dimPipetaRoutes);
app.use('/api/maquinas', dimMaquina_routes_1.dimMaquinaRoutes);
app.use('/api/centros', dimCentro_routes_1.dimCentroRoutes);
app.use('/api/criteriosValidacion', dimCriterioValidacion_routes_1.dimCriterioValidacionRoutes);
app.use('/api/tecnicosLab', tecnicoLab_routes_1.tecnicoLabRoutes);
app.use('/api/worklists', worklist_routes_1.worklistRouter);
// Middleware de manejo de errores
app.use(error_middleware_1.errorHandler);
exports.default = app;
