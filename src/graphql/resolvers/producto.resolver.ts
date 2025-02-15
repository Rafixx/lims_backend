import { Producto } from '../../data/types';
import { productos, tecnicas } from '../../data';

export const productoResolver = {
  Producto: {
    tecnicas: (parent: Producto) =>
      tecnicas.filter((t) => parent.tecnicas.includes(t.id)),
  },
  Query: {
    productos: () => productos,
    producto: (_: any, args: { id: string }) =>
      productos.find((p) => p.id === args.id),
  },
  Mutation: {
    createProducto: (_: any, args: { nombre: string; tecnicas: string[] }) => {
      const newProducto: Producto = {
        id: `prod${productos.length + 1}`,
        nombre: args.nombre,
        tecnicas: args.tecnicas,
      };
      productos.push(newProducto);
      return newProducto;
    },
    updateProducto: (
      _: any,
      args: { id: string; nombre?: string; tecnicas?: string[] }
    ) => {
      const producto = productos.find((p) => p.id === args.id);
      if (!producto) throw new Error('Producto no encontrado');
      if (args.nombre !== undefined) producto.nombre = args.nombre;
      if (args.tecnicas !== undefined) producto.tecnicas = args.tecnicas;
      return producto;
    },
    deleteProducto: (_: any, args: { id: string }) => {
      const index = productos.findIndex((p) => p.id === args.id);
      if (index === -1) throw new Error('Producto no encontrado');
      productos.splice(index, 1);
      return true;
    },
  },
};
