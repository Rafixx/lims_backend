// src/controllers/producto.controller.ts
import { Request, Response } from 'express';
import { productos } from '../data/productos';
import { Producto } from '../data/tipos';

// Obtener todos los productos
export const getProductos = (req: Request, res: Response): void => {
  res.json(productos);
};

// Obtener un producto por su id
export const getProductoById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const producto = productos.find((p) => p.id === id);
  if (!producto) {
    res.status(404).json({ message: 'Producto no encontrado' });
    return;
  }
  res.json(producto);
};

// Crear un nuevo producto
export const createProducto = (req: Request, res: Response): void => {
  // Se espera que el body contenga "nombre" y "tecnicas" (array de IDs de técnicas)
  const newProducto: Producto = {
    id: `prod${productos.length + 1}`,
    ...req.body,
  };
  productos.push(newProducto);
  res.status(201).json(newProducto);
};

// Actualizar un producto existente
export const updateProducto = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = productos.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Producto no encontrado' });
    return;
  }
  const updatedProducto = {
    ...productos[index],
    ...req.body,
  };
  productos[index] = updatedProducto;
  res.json(updatedProducto);
};

// Eliminar un producto
export const deleteProducto = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = productos.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Producto no encontrado' });
    return;
  }
  productos.splice(index, 1);
  res.status(204).send();
};
