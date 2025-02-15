import { productoResolver } from './producto.resolver';
import { tecnicaResolver } from './tecnica.resolver';
import { muestraResolver } from './muestra.resolver';
import { placaResolver } from './placa.resolver';
import { maquinaResolver } from './maquina.resolver';
import { usuarioResolver } from './usuario.resolver';
import { perfilResolver } from './perfil.resolver';
import { JSON } from '../scalars';

export const resolvers = {
  JSON,
  Query: {
    ...productoResolver.Query,
    ...tecnicaResolver.Query,
    ...muestraResolver.Query,
    ...placaResolver.Query,
    ...maquinaResolver.Query,
    ...usuarioResolver.Query,
    ...perfilResolver.Query,
  },
  Mutation: {
    ...productoResolver.Mutation,
    ...tecnicaResolver.Mutation,
    ...muestraResolver.Mutation,
    ...placaResolver.Mutation,
    ...maquinaResolver.Mutation,
    ...usuarioResolver.Mutation,
    ...perfilResolver.Mutation,
  },
  Producto: productoResolver.Producto,
  // Agrega otros resolvers de tipos si es necesario.
};
