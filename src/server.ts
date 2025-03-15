// src/server.ts
import express from 'express';
import http from 'http';
import cors from 'cors';
import solicitudRoutes from './routes/solicitudes.routes';
import muestraRoutes from './routes/muestras.routes';
import userRoutes from './routes/user.routes';
import aparatoRoutes from './routes/aparato.routes';
import estudioRoutes from './routes/estudio.routes';
import procesoRoutes from './routes/proceso.routes';
import authRoutes from './routes/auth.routes';
import { initSocket } from './socket';

export const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/muestras', muestraRoutes);
app.use('/api/users', userRoutes);
app.use('/api/aparatos', aparatoRoutes);
app.use('/api/estudios', estudioRoutes);
app.use('/api/procesos', procesoRoutes);
app.use('/api', authRoutes);

const server = http.createServer(app);

// Inicializa Socket.IO
initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
