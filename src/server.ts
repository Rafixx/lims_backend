// src/server.ts
import express from 'express';
import http from 'http';
import cors from 'cors';
import muestraRoutes from './routes/muestras.routes';
import userRoutes from './routes/user.routes';
import maquinaRoutes from './routes/maquina.routes';
import { initSocket } from './socket';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/muestras', muestraRoutes);
app.use('/api/users', userRoutes);
app.use('/api/maquinas', maquinaRoutes);

const server = http.createServer(app);

// Inicializa Socket.IO
initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
