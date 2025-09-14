"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
    });
    io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado:', socket.id);
        // Puedes definir otros eventos de socket aquí si lo deseas.
        socket.on('actualizar_muestra', (id) => {
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
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO no ha sido inicializado');
    }
    return io;
};
exports.getIO = getIO;
