import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import muestrasRouter, { actualizarMuestra, muestras } from './routes/muestras';
import userRouter from './routes/user';

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Rutas REST básicas (si sigues utilizándolas)
  app.use('/api/muestras', muestrasRouter);
  app.use('/api/user', userRouter);

  // Crear servidor HTTP subyacente
  const server = http.createServer(app);

  // Configuración de Socket.IO
  const io = new SocketIOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado:', socket.id);

    // Dentro de io.on('connection', ...)
    socket.on('actualizar_muestra', (id: number) => {
      console.log(`Evento "actualizar_muestra" recibido para la muestra ${id}`);
      const updatedMuestra = actualizarMuestra(id);
      console.log('Muestra actualizada:', updatedMuestra);
      // Emite la lista completa de muestras actualizada o la muestra individual, según lo que prefieras:
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
}

startServer();
