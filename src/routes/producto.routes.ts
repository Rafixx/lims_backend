// src/routes/producto.routes.ts
import { Router } from 'express';
import {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
} from '../controllers/producto.controller';

const productoRoutes = Router();

productoRoutes.get('/', getProductos);
productoRoutes.get('/:id', getProductoById);
productoRoutes.post('/', createProducto);
productoRoutes.put('/:id', updateProducto);
productoRoutes.delete('/:id', deleteProducto);

export default productoRoutes;
