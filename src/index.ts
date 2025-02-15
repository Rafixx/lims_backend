import express from 'express';
import http from 'http';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { Server as SocketIOServer } from 'socket.io';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import muestrasRouter from './routes/muestras';
import userRouter from './routes/user';

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Endpoints REST (opcional, para coexistir con GraphQL)
  app.use('/api/muestras', muestrasRouter);
  app.use('/api/user', userRouter);

  // Configurar Apollo Server (GraphQL)
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app: app as any });

  // Crear servidor HTTP
  const server = http.createServer(app);

  // Configurar Socket.IO
  const io = new SocketIOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('actualizar_muestras', () => {
      console.log('Evento "actualizar_muestras" recibido');
      // Aquí se invocaría la lógica para actualizar una muestra.
      io.emit('muestra_actualizada', { message: 'Muestras actualizadas' });
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(
      `GraphQL disponible en http://localhost:${PORT}${apolloServer.graphqlPath}`
    );
  });
}

startServer();
