import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

let io: SocketIOServer;

export const initSocket = (server: http.Server): void => {
  io = new SocketIOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado:', socket.id);

    // Puedes definir otros eventos de socket aquí si lo deseas.
    socket.on('actualizar_muestra', (id: string) => {
      console.log(`Evento "actualizar_muestra" recibido para la muestra ${id}`);
      // La lógica de actualización se delega al controlador,
      // por ejemplo, podrías invocar una función del controlador aquí
      // y luego emitir el resultado.
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO no ha sido inicializado');
  }
  return io;
};
