// src/server.ts
import express from 'express';
import http from 'http';
import cors from 'cors';
import muestraRoutes from './routes/muestras.routes';
import userRoutes from './routes/user.routes';
import maquinaRoutes from './routes/maquina.routes';
import productoRoutes from './routes/producto.routes';
import tecnicaRoutes from './routes/tecnica.routes';
import authRoutes from './routes/auth.routes';
import { initSocket } from './socket';

export const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/muestras', muestraRoutes);
app.use('/api/users', userRoutes);
app.use('/api/maquinas', maquinaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/tecnicas', tecnicaRoutes);
app.use('/api', authRoutes);

const server = http.createServer(app);

// Inicializa Socket.IO
initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
