// src/server.ts
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import muestrasRouter, { actualizarMuestra, muestras } from './routes/muestras';
import userRouter from './routes/user';

const app = express();

app.use(cors());
app.use(express.json());

// Usa el router de muestras para las rutas /api/muestras
app.use('/api/muestras', muestrasRouter);
app.use('/api/user', userRouter);

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // En producción, restringe esto a los orígenes permitidos
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  // Escucha el evento 'actualizar_muestras' proveniente del frontend
  socket.on('actualizar_muestras', () => {
    console.log('Evento "actualizar_muestras" recibido en backend');

    // Actualiza la muestra con id 1 (por ejemplo)
    const updatedMuestra = actualizarMuestra(1);
    console.log('Muestra actualizada:', updatedMuestra);

    // Emite el evento 'muestra_actualizada' a todos los clientes con la lista actualizada
    io.emit('muestra_actualizada', muestras);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
